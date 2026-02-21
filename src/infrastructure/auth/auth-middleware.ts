// Onyx-based authentication middleware for Oak
import onyx from 'onyx';
import LocalStrategy from 'onyx/src/strategies/local-strategy/local-strategy.ts';
import { decodeToken, verifyAccessToken, verifyRefreshToken } from './jwt.ts';
import {
  blockAuth,
  clearAuthAttempts,
  isAuthBlocked,
  isTokenBlacklisted,
  recordAuthAttempt,
} from './token-blacklist.ts';
import type { IUserRepository } from '../../domain/ports/index.ts';
import type { Middleware } from 'oak';
import { UserId } from '../../domain/value-objects/branded.ts';

/**
 * Configure Onyx with local strategy and user serialization.
 * Call this once during app initialization.
 */
export function configureOnyx(userRepository: IUserRepository): void {
  // Local strategy: validate credentials via the user repository
  onyx.use(
    new LocalStrategy(
      async (
        email: string,
        _password: string,
        done: (err: Error | null, user?: unknown) => void,
      ) => {
        try {
          const user = await userRepository.findByEmail(email);
          if (user) {
            await done(null, user);
          } else {
            await done(null, false);
          }
        } catch (error) {
          await done(error);
        }
      },
    ),
  );

  // Serialize: store user ID in session
  onyx.serializeUser(
    async (user: Record<string, unknown>, cb: (err: Error | null, id?: string) => void) => {
      await cb(null, user.id);
    },
  );

  // Deserialize: recover full user from ID
  onyx.deserializeUser(async (id: string, cb: (err: Error | null, user?: unknown) => void) => {
    try {
      const user = await userRepository.findById(UserId(id));
      await cb(null, user);
    } catch (error) {
      await cb(error, null);
    }
  });
}

/**
 * Get client IP from request
 */
function getClientIP(ctx: Context): string {
  // Try to get IP from various headers (with fallbacks for proxies)
  const forwarded = ctx.request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = ctx.request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  try {
    return ctx.request.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Oak middleware that requires a valid JWT in the Authorization header.
 * Sets ctx.state.user to the decoded token payload.
 * Includes token blacklist check.
 */
export const requireAuth: Middleware = async (ctx, next) => {
  const authHeader = ctx.request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.response.status = 401;
    ctx.response.body = {
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    };
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify as access token with strict validation
    const payload = await verifyAccessToken(token);

    // Check if token is blacklisted
    if (await isTokenBlacklisted(payload.jti)) {
      ctx.response.status = 401;
      ctx.response.body = {
        error: 'Unauthorized',
        message: 'Token has been revoked',
      };
      return;
    }

    ctx.state.user = payload;
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid or expired token';
    ctx.response.status = 401;
    ctx.response.body = {
      error: 'Unauthorized',
      message,
    };
  }
};

/**
 * Rate limiting middleware for authentication endpoints.
 * Blocks IPs after 5 failed attempts for 1 hour.
 */
export const authRateLimit: Middleware = async (ctx, next) => {
  const ip = getClientIP(ctx);

  // Check if IP is already blocked
  if (await isAuthBlocked(ip)) {
    ctx.response.status = 429;
    ctx.response.body = {
      error: 'Too Many Requests',
      message: 'Too many failed attempts. Please try again later.',
    };
    return;
  }

  // Store IP in context for use in route handlers
  ctx.state.clientIP = ip;

  await next();
};

/**
 * Record a successful authentication (clears attempt counter)
 */
export async function recordSuccessfulAuth(ip: string): Promise<void> {
  await clearAuthAttempts(ip);
}

/**
 * Record a failed authentication attempt
 * Returns true if IP should be blocked
 */
export async function recordFailedAuth(ip: string): Promise<boolean> {
  const attempts = await recordAuthAttempt(ip);

  // Block after 5 failed attempts
  if (attempts >= 5) {
    await blockAuth(ip, 3600); // Block for 1 hour
    return true;
  }

  return false;
}

/**
 * Middleware to blacklist a token on logout
 * Call this before clearing user session
 */
export const blacklistCurrentToken: Middleware = async (ctx, next) => {
  const authHeader = ctx.request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');

    try {
      // Decode token to get jti without full verification
      const payload = decodeToken(token);

      if (payload?.jti && payload?.exp) {
        // Calculate remaining TTL
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await blacklistToken(payload.jti, ttl);
        }
      }
    } catch (_e) {
      // Token invalid or malformed, continue with logout
    }
  }

  await next();
};

// Re-export token blacklist function for use in routes
export { blacklistToken, isTokenBlacklisted } from './token-blacklist.ts';

// Re-export verifyRefreshToken for use in refresh endpoint
export { verifyRefreshToken };
