// Health check routes
import { OakRouter } from "../../deps.ts";

export const healthRouter = new OakRouter();

healthRouter.get("/", (ctx) => {
  ctx.response.body = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: performance.now(),
    version: "1.0.0",
  };
});

healthRouter.get("/ready", async (ctx) => {
  // Check database connection
  // Check Redis connection
  const checks = {
    database: true, // TODO: Implement actual check
    redis: true, // TODO: Implement actual check
  };

  const allHealthy = Object.values(checks).every(Boolean);

  ctx.response.status = allHealthy ? 200 : 503;
  ctx.response.body = {
    ready: allHealthy,
    checks,
    timestamp: new Date().toISOString(),
  };
});
