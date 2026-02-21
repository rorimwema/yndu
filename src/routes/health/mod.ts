// Health check routes with Redis and Database checks
import { Router } from '../../deps.ts';
import { isRedisHealthy } from '../../infrastructure/config/redis.ts';
import { db } from '../../infrastructure/config/database.ts';

export const healthRouter = new Router();

/**
 * Basic health check - returns 200 if server is running
 */
healthRouter.get('/', (ctx) => {
  ctx.response.body = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    version: '1.0.0',
  };
});

/**
 * Readiness check - verifies all dependencies are available
 * Returns 503 if any dependency is unhealthy
 */
healthRouter.get('/ready', async (ctx) => {
  const checks = {
    database: await checkDatabaseHealth(),
    redis: await isRedisHealthy(),
  };

  const allHealthy = Object.values(checks).every(Boolean);

  ctx.response.status = allHealthy ? 200 : 503;
  ctx.response.body = {
    ready: allHealthy,
    checks,
    timestamp: new Date().toISOString(),
  };
});

/**
 * Detailed health check with component status
 */
healthRouter.get('/detailed', async (ctx) => {
  const [dbHealthy, redisHealth] = await Promise.all([
    checkDatabaseHealth(),
    getRedisHealth(),
  ]);

  const allHealthy = dbHealthy && redisHealth.connected;

  ctx.response.status = allHealthy ? 200 : 503;
  ctx.response.body = {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    version: '1.0.0',
    components: {
      database: {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        type: 'postgresql',
      },
      redis: {
        status: redisHealth.connected ? 'healthy' : 'unhealthy',
        usingFallback: redisHealth.usingFallback,
        fallbackStats: redisHealth.memoryStats,
      },
    },
  };
});

/**
 * Check database connectivity
 */
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Try a simple query
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Liveness probe - basic check that server is responsive
 */
healthRouter.get('/live', (ctx) => {
  ctx.response.body = {
    alive: true,
    timestamp: new Date().toISOString(),
  };
});
