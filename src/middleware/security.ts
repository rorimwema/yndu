// Security middleware - CSRF protection, secure headers, request validation
import type { Middleware } from '../deps.ts';

// CSRF token storage (in production use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * Generate secure random CSRF token
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomUUID();
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 3600000, // 1 hour
  });
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;

  // Check expiry
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Constant time comparison to prevent timing attacks
  const match = timingSafeEqual(stored.token, token);

  // Rotate token after use (one-time use)
  csrfTokens.delete(sessionId);

  return match;
}

/**
 * Constant time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Security headers middleware
 */
export const securityHeaders: Middleware = async (ctx, next) => {
  // Prevent clickjacking
  ctx.response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  ctx.response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection
  ctx.response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  ctx.response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  ctx.response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)',
  );

  // Content Security Policy
  ctx.response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Consider removing unsafe-inline
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  // Remove server identification
  ctx.response.headers.delete('Server');
  ctx.response.headers.delete('X-Powered-By');

  await next();
};

/**
 * CSRF protection middleware for state-changing operations
 */
export const csrfProtection: Middleware = async (ctx, next) => {
  // Skip for GET, HEAD, OPTIONS requests
  const method = ctx.request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    await next();
    return;
  }

  // Skip for authentication endpoints (they handle their own security)
  if (ctx.request.url.pathname.startsWith('/api/auth/')) {
    await next();
    return;
  }

  // Get CSRF token from header
  const csrfToken = ctx.request.headers.get('X-CSRF-Token');
  const sessionId = ctx.state.sessionId; // Should be set by session middleware

  if (!csrfToken || !sessionId) {
    ctx.response.status = 403;
    ctx.response.body = { error: 'CSRF token missing' };
    return;
  }

  if (!validateCsrfToken(sessionId, csrfToken)) {
    ctx.response.status = 403;
    ctx.response.body = { error: 'Invalid CSRF token' };
    return;
  }

  await next();
};

/**
 * Request validation middleware
 */
export const validateRequest: Middleware = async (ctx, next) => {
  // Validate content type for POST/PUT/PATCH
  const method = ctx.request.method;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = ctx.request.headers.get('Content-Type') || '';

    // Reject requests without proper content type (prevents some injection attacks)
    if (!contentType.includes('application/json')) {
      // Allow multipart for file uploads
      if (!contentType.includes('multipart/form-data')) {
        ctx.response.status = 415;
        ctx.response.body = { error: 'Unsupported Media Type' };
        return;
      }
    }

    // Maximum body size check (10MB)
    const contentLength = parseInt(ctx.request.headers.get('Content-Length') || '0');
    if (contentLength > 10 * 1024 * 1024) {
      ctx.response.status = 413;
      ctx.response.body = { error: 'Payload Too Large' };
      return;
    }
  }

  // Validate origin for sensitive operations
  const origin = ctx.request.headers.get('Origin');
  const allowedOrigins = ['http://localhost:3000', 'https://yndu.co.ke']; // Configure properly

  if (origin && !allowedOrigins.includes(origin)) {
    // Log suspicious request
    console.warn(`Suspicious request from origin: ${origin}`);
  }

  await next();
};

/**
 * IP-based rate limiting middleware
 */
export const ipRateLimit = (options: { windowMs: number; max: number }): Middleware => {
  const requests = new Map<string, number[]>();

  return async (ctx, next) => {
    let ip = 'unknown';
    try {
      ip = ctx.request.ip || 'unknown';
    } catch {
      ip = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ctx.request.headers.get('x-real-ip') || 'unknown';
    }
    if (ip === 'unknown') {
      ip = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        ctx.request.headers.get('x-real-ip') || 'unknown';
    }
    const now = Date.now();

    // Get existing requests
    const timestamps = requests.get(ip) || [];

    // Filter to only include requests within the window
    const validTimestamps = timestamps.filter(
      (time) => now - time < options.windowMs,
    );

    // Check if limit exceeded
    if (validTimestamps.length >= options.max) {
      ctx.response.status = 429;
      ctx.response.body = { error: 'Too Many Requests' };
      return;
    }

    // Add current request
    validTimestamps.push(now);
    requests.set(ip, validTimestamps);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, times] of requests.entries()) {
        const valid = times.filter((t) => now - t < options.windowMs);
        if (valid.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, valid);
        }
      }
    }

    await next();
  };
};

/**
 * Session ID middleware - generates or retrieves session ID for CSRF protection
 */
export const sessionIdMiddleware: Middleware = async (ctx, next) => {
  // Get session ID from cookie or generate new one
  let sessionId = ctx.cookies.get('session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    ctx.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400000, // 24 hours
    });
  }

  ctx.state.sessionId = sessionId;
  await next();
};

/**
 * API rate limiting by user (for authenticated routes)
 */
export const userRateLimit = (options: { windowMs: number; max: number }): Middleware => {
  const requests = new Map<string, number[]>();

  return async (ctx, next) => {
    // Use user ID if authenticated, otherwise IP
    const userId = ctx.state.user?.sub;
    const ip = ctx.request.ip || 'unknown';
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    const now = Date.now();

    // Get existing requests
    const timestamps = requests.get(key) || [];

    // Filter to only include requests within the window
    const validTimestamps = timestamps.filter(
      (time) => now - time < options.windowMs,
    );

    // Check if limit exceeded
    if (validTimestamps.length >= options.max) {
      ctx.response.status = 429;
      ctx.response.headers.set('Retry-After', String(Math.ceil(options.windowMs / 1000)));
      ctx.response.body = { error: 'Rate limit exceeded. Please try again later.' };
      return;
    }

    // Add current request
    validTimestamps.push(now);
    requests.set(key, validTimestamps);

    // Set rate limit headers
    ctx.response.headers.set('X-RateLimit-Limit', String(options.max));
    ctx.response.headers.set('X-RateLimit-Remaining', String(options.max - validTimestamps.length));

    await next();
  };
};
