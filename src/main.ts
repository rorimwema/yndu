// Main entry point for Yndu Deno application
import { OakApp, oakCors } from './deps.ts';
import { createRouter } from './routes/mod.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { requestLogger } from './middleware/logger.ts';
import {
  ipRateLimit,
  securityHeaders,
  sessionIdMiddleware,
  validateRequest,
} from './middleware/security.ts';
import { connectDatabase, db } from './infrastructure/config/database.ts';
import { createContainer, setContainer } from './infrastructure/container.ts';
import { config } from './infrastructure/config/env.ts';

const PORT = config.port;
const HOST = config.host;

// Create Oak application
const app = new OakApp();

// Security middleware (order matters - security first)
app.use(securityHeaders);
app.use(
  ipRateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
  }),
);
app.use(sessionIdMiddleware);
app.use(validateRequest);

// Request logging
app.use(requestLogger);

// CORS - use configured origin, not wildcard in production
app.use(oakCors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
}));

// Initialize DI container with database connection
await connectDatabase();
const container = createContainer(db);
setContainer(container);

// Routes
const router = createRouter();
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Close Redis connection
  const { closeRedisConnection } = await import('./infrastructure/config/redis.ts');
  await closeRedisConnection();

  // Close database connections
  await db.destroy();

  console.log('✅ Cleanup complete. Exiting.');
  Deno.exit(0);
};

// Listen for shutdown signals
Deno.addSignalListener('SIGINT', () => shutdown('SIGINT'));
Deno.addSignalListener('SIGTERM', () => shutdown('SIGTERM'));

// Start server
console.log(`🚀 Yndu server running at http://${HOST}:${PORT}`);
console.log(`📊 Environment: ${config.env}`);
console.log(`🔐 Auth: JWT middleware active`);
console.log(`🛡️  Security: CSRF, secure headers, and rate limiting enabled`);
console.log(`📦 Redis: Connection pooling and fallback enabled`);

await app.listen({ hostname: HOST, port: PORT });
