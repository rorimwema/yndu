// Redis-based rate limiting middleware
import type { Middleware } from '../deps.ts';
import {
  executeWithRetry,
  getRedisClient as _getRedisClient,
  isRedisHealthy,
} from '../infrastructure/config/redis.ts';

// Fallback in-memory rate limiting when Redis is unavailable
const memoryRateLimits = new Map<string, { timestamps: number[]; windowStart: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
  skipSuccessfulRequests?: boolean; // Don't count successful requests (2xx/3xx)
  skipFailedRequests?: boolean; // Don't count failed requests (4xx/5xx)
}

/**
 * Get client IP from request
 */
function getClientIP(ctx: Context): string {
  const forwarded = ctx.request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = ctx.request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return ctx.request.ip || 'unknown';
}

/**
 * Redis-based rate limiting middleware
 * Falls back to in-memory when Redis is unavailable
 */
export function redisRateLimit(options: RateLimitOptions): Middleware {
  const { windowMs, max, keyPrefix = 'ratelimit' } = options;

  return async (ctx, next) => {
    const ip = getClientIP(ctx);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    // Try Redis first
    const redisAvailable = await isRedisHealthy();

    if (redisAvailable) {
      try {
        const allowed = await checkRedisRateLimit(key, ip, now, windowMs, max);
        if (!allowed) {
          ctx.response.status = 429;
          ctx.response.headers.set('Retry-After', String(Math.ceil(windowMs / 1000)));
          ctx.response.body = {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
          };
          return;
        }
      } catch (error) {
        console.warn('Redis rate limit failed, falling back to memory:', error);
        // Fall through to memory-based
      }
    }

    // Memory-based fallback
    const allowed = checkMemoryRateLimit(ip, now, windowMs, max);
    if (!allowed) {
      ctx.response.status = 429;
      ctx.response.headers.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      ctx.response.body = {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      };
      return;
    }

    // Add rate limit headers
    ctx.response.headers.set('X-RateLimit-Limit', String(max));
    ctx.response.headers.set('X-RateLimit-Window', String(windowMs));

    await next();
  };
}

/**
 * Check rate limit using Redis
 */
async function checkRedisRateLimit(
  key: string,
  _ip: string,
  now: number,
  windowMs: number,
  max: number,
): Promise<boolean> {
  return await executeWithRetry(async (redis) => {
    const _windowStart = now - windowMs;

    // Remove old entries outside the window
    // Note: This is a simplified implementation. For production, use a Redis Lua script
    // or Redis sorted sets for atomic operations

    // Get current count
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // Get TTL
    const ttl = await redis.ttl(key);

    if (count >= max) {
      // Check if window has expired
      if (ttl <= 0) {
        // Window expired, reset
        await redis.setex(key, Math.ceil(windowMs / 1000), '1');
        return true;
      }
      return false; // Rate limit exceeded
    }

    // Increment counter
    const newCount = await redis.incr(key);

    // Set expiry on first request
    if (newCount === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return true;
  });
}

/**
 * Check rate limit using in-memory Map (fallback)
 */
function checkMemoryRateLimit(
  ip: string,
  now: number,
  windowMs: number,
  max: number,
): boolean {
  const windowStart = now - windowMs;

  let entry = memoryRateLimits.get(ip);

  if (!entry || now > entry.windowStart + windowMs) {
    // New window
    entry = { timestamps: [now], windowStart: now };
    memoryRateLimits.set(ip, entry);
    return true;
  }

  // Remove timestamps outside window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= max) {
    return false; // Rate limit exceeded
  }

  entry.timestamps.push(now);
  return true;
}

/**
 * Auth-specific rate limiting with stricter limits
 */
export function authRateLimit(): Middleware {
  return redisRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    keyPrefix: 'auth:ratelimit',
  });
}

/**
 * API rate limiting with general limits
 */
export function apiRateLimit(): Middleware {
  return redisRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    keyPrefix: 'api:ratelimit',
  });
}

/**
 * Strict rate limiting for sensitive endpoints
 */
export function strictRateLimit(): Middleware {
  return redisRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    keyPrefix: 'strict:ratelimit',
  });
}
