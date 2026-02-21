// Token blacklist using Redis with proper error handling and fallback
import {
  executeWithRetry,
  getRedisClient as _getRedisClient,
  isRedisHealthy,
} from '../config/redis.ts';

// Fallback to in-memory Map if Redis is unavailable
const memoryBlacklist = new Map<string, number>();
const memoryAuthAttempts = new Map<string, { count: number; expires: number }>();
const memoryBlockedIPs = new Map<string, number>();

let redisAvailable = true;
let lastRedisCheck = 0;
const REDIS_CHECK_INTERVAL = 30000; // Check Redis health every 30 seconds

/**
 * Check if Redis is available with caching
 */
async function checkRedisAvailability(): Promise<boolean> {
  const now = Date.now();
  if (now - lastRedisCheck > REDIS_CHECK_INTERVAL) {
    redisAvailable = await isRedisHealthy();
    lastRedisCheck = now;
  }
  return redisAvailable;
}

/**
 * Add a token to the blacklist
 * @param jti - JWT ID (token unique identifier)
 * @param expirySeconds - Time until the token naturally expires
 */
export async function blacklistToken(jti: string, expirySeconds: number): Promise<void> {
  if (await checkRedisAvailability()) {
    try {
      await executeWithRetry(async (redis) => {
        await redis.setex(`token:blacklist:${jti}`, expirySeconds, '1');
      });
      return;
    } catch (error) {
      console.warn('Redis blacklist failed, falling back to memory:', error);
    }
  }

  // Fallback to memory
  const expiresAt = Date.now() + (expirySeconds * 1000);
  memoryBlacklist.set(jti, expiresAt);

  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    cleanupMemoryBlacklist();
  }
}

/**
 * Check if a token is blacklisted
 * @param jti - JWT ID (token unique identifier)
 * @returns true if token is blacklisted
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  if (await checkRedisAvailability()) {
    try {
      const result = await executeWithRetry(async (redis) => {
        return await redis.get(`token:blacklist:${jti}`);
      });
      return result !== null;
    } catch (error) {
      console.warn('Redis blacklist check failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  const expiresAt = memoryBlacklist.get(jti);
  if (!expiresAt) return false;

  if (Date.now() > expiresAt) {
    memoryBlacklist.delete(jti);
    return false;
  }

  return true;
}

/**
 * Clean up expired entries from memory blacklist
 */
function cleanupMemoryBlacklist(): void {
  const now = Date.now();
  for (const [jti, expiresAt] of memoryBlacklist.entries()) {
    if (now > expiresAt) {
      memoryBlacklist.delete(jti);
    }
  }
}

/**
 * Record a failed authentication attempt
 * @param ip - Client IP address
 * @returns Current number of attempts
 */
export async function recordAuthAttempt(ip: string): Promise<number> {
  if (await checkRedisAvailability()) {
    try {
      return await executeWithRetry(async (redis) => {
        const key = `auth:attempts:${ip}`;
        const attempts = await redis.incr(key);

        // Set expiry on first attempt (15 minute window)
        if (attempts === 1) {
          await redis.expire(key, 900);
        }

        return attempts;
      });
    } catch (error) {
      console.warn('Redis auth attempt tracking failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  const existing = memoryAuthAttempts.get(ip);
  const now = Date.now();

  if (!existing || now > existing.expires) {
    memoryAuthAttempts.set(ip, { count: 1, expires: now + (15 * 60 * 1000) });
    return 1;
  }

  existing.count++;
  return existing.count;
}

/**
 * Check if an IP is blocked due to too many failed auth attempts
 * @param ip - Client IP address
 * @returns true if IP is blocked
 */
export async function isAuthBlocked(ip: string): Promise<boolean> {
  if (await checkRedisAvailability()) {
    try {
      const result = await executeWithRetry(async (redis) => {
        return await redis.get(`auth:blocked:${ip}`);
      });
      return result !== null;
    } catch (error) {
      console.warn('Redis auth block check failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  const blockedUntil = memoryBlockedIPs.get(ip);
  if (!blockedUntil) return false;

  if (Date.now() > blockedUntil) {
    memoryBlockedIPs.delete(ip);
    return false;
  }

  return true;
}

/**
 * Block an IP address from making auth attempts
 * @param ip - Client IP address
 * @param durationSeconds - Duration to block (default: 1 hour)
 */
export async function blockAuth(ip: string, durationSeconds: number = 3600): Promise<void> {
  if (await checkRedisAvailability()) {
    try {
      await executeWithRetry(async (redis) => {
        await redis.setex(`auth:blocked:${ip}`, durationSeconds, '1');
      });
      return;
    } catch (error) {
      console.warn('Redis auth block failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  memoryBlockedIPs.set(ip, Date.now() + (durationSeconds * 1000));
}

/**
 * Clear auth attempts for an IP (e.g., after successful login)
 * @param ip - Client IP address
 */
export async function clearAuthAttempts(ip: string): Promise<void> {
  if (await checkRedisAvailability()) {
    try {
      await executeWithRetry(async (redis) => {
        await redis.del(`auth:attempts:${ip}`);
      });
      return;
    } catch (error) {
      console.warn('Redis clear auth attempts failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  memoryAuthAttempts.delete(ip);
}

/**
 * Get remaining TTL for auth block
 * @param ip - Client IP address
 * @returns TTL in seconds, or 0 if not blocked
 */
export async function getAuthBlockTTL(ip: string): Promise<number> {
  if (await checkRedisAvailability()) {
    try {
      return await executeWithRetry(async (redis) => {
        const ttl = await redis.ttl(`auth:blocked:${ip}`);
        return ttl > 0 ? ttl : 0;
      });
    } catch (error) {
      console.warn('Redis TTL check failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  const blockedUntil = memoryBlockedIPs.get(ip);
  if (!blockedUntil) return 0;

  const remaining = Math.floor((blockedUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Get remaining auth attempts before block
 * @param ip - Client IP address
 * @param maxAttempts - Maximum allowed attempts (default: 5)
 * @returns Remaining attempts, or 0 if already blocked
 */
export async function getRemainingAuthAttempts(
  ip: string,
  maxAttempts: number = 5,
): Promise<number> {
  if (await checkRedisAvailability()) {
    try {
      return await executeWithRetry(async (redis) => {
        const attempts = await redis.get(`auth:attempts:${ip}`);
        const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
        return Math.max(0, maxAttempts - currentAttempts);
      });
    } catch (error) {
      console.warn('Redis remaining attempts check failed, using memory fallback:', error);
    }
  }

  // Fallback to memory
  const existing = memoryAuthAttempts.get(ip);
  if (!existing) return maxAttempts;

  if (Date.now() > existing.expires) {
    memoryAuthAttempts.delete(ip);
    return maxAttempts;
  }

  return Math.max(0, maxAttempts - existing.count);
}

/**
 * Get Redis health status for monitoring
 */
export async function getRedisHealth(): Promise<{
  connected: boolean;
  usingFallback: boolean;
  memoryStats: {
    blacklistSize: number;
    authAttemptsSize: number;
    blockedIPsSize: number;
  };
}> {
  const connected = await checkRedisAvailability();

  return {
    connected,
    usingFallback: !connected,
    memoryStats: {
      blacklistSize: memoryBlacklist.size,
      authAttemptsSize: memoryAuthAttempts.size,
      blockedIPsSize: memoryBlockedIPs.size,
    },
  };
}
