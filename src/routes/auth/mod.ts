// Auth API routes — register, login, refresh, me, logout
import { OakContext, Router } from '../../deps.ts';
import { compare, hash } from 'bcrypt';
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../infrastructure/auth/jwt.ts';
import {
  authRateLimit,
  recordFailedAuth,
  recordSuccessfulAuth,
  requireAuth,
} from '../../infrastructure/auth/auth-middleware.ts';
import { blacklistToken } from '../../infrastructure/auth/token-blacklist.ts';
import { getContainer } from '../../infrastructure/container.ts';
import { UserId } from '../../domain/value-objects/branded.ts';
import { z } from 'zod';

export const authRouter = new Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Get client IP from request context
 */
function getClientIP(ctx: OakContext): string {
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

// POST /api/auth/register — with rate limiting
authRouter.post('/register', authRateLimit, async (ctx: OakContext) => {
  try {
    const body = await ctx.request.body.json();
    const data = registerSchema.parse(body);
    const container = getContainer();

    // Check if user already exists
    const existing = await container.userRepository.findByEmail(data.email);
    if (existing) {
      ctx.response.status = 409;
      ctx.response.body = {
        error: 'Conflict',
        message: 'A user with this email already exists',
      };
      return;
    }

    // Hash password
    const passwordHash = await hash(data.password);

    // Create user
    const userId = crypto.randomUUID();
    const now = new Date();

    await container.userRepository.save({
      id: userId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      passwordHash,
      addresses: [],
      createdAt: now,
      updatedAt: now,
    });

    // Generate tokens
    const accessToken = await createAccessToken(userId, data.email);
    const refreshToken = await createRefreshToken(userId);

    // Store refresh token
    await container.userRepository.updateRefreshToken(UserId(userId), refreshToken);

    // Clear any auth attempts for this IP
    const ip = getClientIP(ctx);
    await recordSuccessfulAuth(ip);

    ctx.response.status = 201;
    ctx.response.body = {
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'B2C_CUSTOMER',
      },
      token: accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: 'Validation Error',
        details: error.errors,
      };
      return;
    }
    console.error('Register error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal Server Error' };
  }
});

// POST /api/auth/login — with rate limiting
authRouter.post('/login', authRateLimit, async (ctx: OakContext) => {
  try {
    const body = await ctx.request.body.json();
    const data = loginSchema.parse(body);
    const container = getContainer();

    // Find user
    const user = await container.userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      // Record failed attempt
      const ip = getClientIP(ctx);
      const shouldBlock = await recordFailedAuth(ip);

      if (shouldBlock) {
        ctx.response.status = 429;
        ctx.response.body = {
          error: 'Too Many Requests',
          message: 'Too many failed attempts. Blocked for 1 hour.',
        };
        return;
      }

      ctx.response.status = 401;
      ctx.response.body = {
        error: 'Unauthorized',
        message: 'Invalid email or password',
      };
      return;
    }

    // Verify password
    const valid = await compare(data.password, user.passwordHash);
    if (!valid) {
      // Record failed attempt
      const ip = getClientIP(ctx);
      const shouldBlock = await recordFailedAuth(ip);

      if (shouldBlock) {
        ctx.response.status = 429;
        ctx.response.body = {
          error: 'Too Many Requests',
          message: 'Too many failed attempts. Blocked for 1 hour.',
        };
        return;
      }

      ctx.response.status = 401;
      ctx.response.body = {
        error: 'Unauthorized',
        message: 'Invalid email or password',
      };
      return;
    }

    // Generate tokens
    const accessToken = await createAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);

    // Store refresh token and update last login
    await container.userRepository.updateRefreshToken(UserId(user.id), refreshToken);
    await container.userRepository.updateLastLogin(UserId(user.id));

    // Clear auth attempts on successful login
    const ip = getClientIP(ctx);
    await recordSuccessfulAuth(ip);

    ctx.response.body = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token: accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: 'Validation Error',
        details: error.errors,
      };
      return;
    }
    console.error('Login error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal Server Error' };
  }
});

// POST /api/auth/refresh — validate refresh token strictly
authRouter.post('/refresh', async (ctx: OakContext) => {
  try {
    const body = await ctx.request.body.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Refresh token is required' };
      return;
    }

    // Verify refresh token with strict validation
    const payload = await verifyRefreshToken(refreshToken);
    const container = getContainer();

    // Find user and validate stored refresh token
    const user = await container.userRepository.findById(UserId(payload.sub));
    if (!user || user.refreshToken !== refreshToken) {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Invalid refresh token' };
      return;
    }

    // Issue new tokens
    const newAccessToken = await createAccessToken(user.id, user.email);
    const newRefreshToken = await createRefreshToken(user.id);

    // Rotate refresh token
    await container.userRepository.updateRefreshToken(UserId(user.id), newRefreshToken);

    ctx.response.body = {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (_error) {
    ctx.response.status = 401;
    ctx.response.body = { error: 'Invalid or expired refresh token' };
  }
});

// GET /api/auth/me — requires valid JWT
authRouter.get('/me', requireAuth, async (ctx: OakContext) => {
  try {
    const container = getContainer();
    const user = await container.userRepository.findById(UserId(ctx.state.user.sub));

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'User not found' };
      return;
    }

    ctx.response.body = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    };
  } catch (_error) {
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal Server Error' };
  }
});

// POST /api/auth/logout — invalidate refresh token and blacklist access token
authRouter.post('/logout', requireAuth, async (ctx: OakContext) => {
  try {
    const container = getContainer();
    const authHeader = ctx.request.headers.get('Authorization');

    // Blacklist the access token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const payload = await verifyAccessToken(token);
        // Blacklist the token (store until its expiry)
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await blacklistToken(payload.jti, ttl);
        }
      } catch (_e) {
        // Token invalid, continue with logout
      }
    }

    // Clear refresh token from database
    await container.userRepository.updateRefreshToken(
      UserId(ctx.state.user.sub),
      null,
    );

    ctx.response.body = { message: 'Logged out successfully' };
  } catch (_error) {
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal Server Error' };
  }
});
