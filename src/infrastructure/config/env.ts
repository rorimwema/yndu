// Environment configuration
import { getEnv } from './secret-env.ts';

export const config = {
  // Server
  port: parseInt(getEnv('PORT', '8000')),
  host: getEnv('HOST', '0.0.0.0'),
  env: getEnv('NODE_ENV', 'development'),

  // Database
  database: {
    host: getEnv('DATABASE_HOST', 'localhost'),
    port: parseInt(getEnv('DATABASE_PORT', '5432')),
    user: getEnv('DATABASE_USER', 'postgres'),
    password: getEnv('DATABASE_PASSWORD', 'pass'),
    name: getEnv('DATABASE_NAME', 'yndu'),
  },

  // Redis
  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: parseInt(getEnv('REDIS_PORT', '6379')),
    password: getEnv('REDIS_PASSWORD', ''),
    username: getEnv('REDIS_USERNAME', ''),
    db: parseInt(getEnv('REDIS_DB', '0')),
  },

  // Security
  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:3000'), // NOT "*" in production
  },

  // JWT
  jwt: {
    secret: getEnv('JWT_SECRET', ''), // Empty default forces explicit setting
    expiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
  },

  // Security settings
  security: {
    bcryptRounds: parseInt(getEnv('BCRYPT_ROUNDS', '12')),
    sessionTimeout: parseInt(getEnv('SESSION_TIMEOUT', '600')), // 10 minutes
    refreshTokenTimeout: parseInt(getEnv('REFRESH_TOKEN_TIMEOUT', '604800')), // 7 days
    maxLoginAttempts: parseInt(getEnv('MAX_LOGIN_ATTEMPTS', '5')),
    lockoutDuration: parseInt(getEnv('LOCKOUT_DURATION', '3600')), // 1 hour
    rateLimitWindowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
    rateLimitMax: parseInt(getEnv('RATE_LIMIT_MAX', '100')),
  },
} as const;

// Validate critical security settings in production
if (config.env === 'production') {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET must be set to a strong random string (min 32 characters) in production',
    );
  }
  if (config.cors.origin === '*') {
    throw new Error(
      "FATAL: CORS_ORIGIN cannot be '*' in production. Set a specific origin.",
    );
  }
}
