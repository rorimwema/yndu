// Redis configuration with connection pooling, authentication, and error handling
import { getEnv } from './secret-env.ts';

// Redis configuration interface
interface RedisConfig {
  hostname: string;
  port: number;
  password?: string;
  username?: string;
  db?: number;
  maxRetriesPerRequest: number;
  connectTimeout: number;
  lazyConnect: boolean;
}

// Singleton Redis client instance
let redisClient: Awaited<ReturnType<typeof createRedisClient>> | null = null;
let connectionPromise: Promise<Awaited<ReturnType<typeof createRedisClient>> | null> | null = null;
let isShuttingDown = false;

/**
 * Get Redis configuration from environment
 */
function getRedisConfig(): RedisConfig {
  const password = getEnv('REDIS_PASSWORD', '');
  const username = getEnv('REDIS_USERNAME', '');

  return {
    hostname: getEnv('REDIS_HOST', 'localhost'),
    port: parseInt(getEnv('REDIS_PORT', '6379')),
    ...(password && { password }),
    ...(username && { username }),
    db: parseInt(getEnv('REDIS_DB', '0')),
    maxRetriesPerRequest: 3,
    connectTimeout: 10000, // 10 seconds
    lazyConnect: true, // Don't connect immediately, wait for first command
  };
}

/**
 * Create a new Redis client with proper error handling
 */
async function createRedisClient() {
  try {
    const { connect } = await import('redis');
    const config = getRedisConfig();

    const redis = await connect({
      hostname: config.hostname,
      port: config.port,
      ...(config.password && { password: config.password }),
      ...(config.username && { username: config.username }),
    });

    // Set up event handlers
    redis.on('error', (err: Error) => {
      console.error('❌ Redis error:', err.message);
      // Don't throw here - let the retry logic handle it
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    redis.on('end', () => {
      console.log('🔌 Redis connection closed');
    });

    return redis;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Get the singleton Redis client instance
 * Implements connection pooling pattern with lazy initialization
 */
export async function getRedisClient() {
  if (isShuttingDown) {
    throw new Error('Redis client is shutting down');
  }

  // Return existing client if available
  if (redisClient) {
    return redisClient;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return await connectionPromise;
  }

  // Create new connection
  connectionPromise = createRedisClient()
    .then((client) => {
      redisClient = client;
      return client;
    })
    .catch((err) => {
      console.error('Failed to create Redis client:', err);
      redisClient = null;
      throw err;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return await connectionPromise;
}

/**
 * Check if Redis is connected and healthy
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  isShuttingDown = true;

  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ Redis connection closed gracefully');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    } finally {
      redisClient = null;
    }
  }
}

/**
 * Reset Redis client (for testing or reconnection)
 */
export function resetRedisClient(): void {
  redisClient = null;
  connectionPromise = null;
}

/**
 * Execute a Redis command with automatic retry logic
 */
export async function executeWithRetry<T>(
  operation: (redis: Awaited<ReturnType<typeof connect>>) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const redis = await getRedisClient();
      return await operation(redis);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Reset client on connection errors to force reconnection
      if (
        lastError.message.includes('Connection refused') ||
        lastError.message.includes('ECONNREFUSED') ||
        lastError.message.includes('ENOTFOUND')
      ) {
        resetRedisClient();
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.warn(
          `Redis operation failed (attempt ${
            attempt + 1
          }/${maxRetries}), retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Redis operation failed after retries');
}

// Re-export for backward compatibility
export { getRedisClient as connectRedis };
