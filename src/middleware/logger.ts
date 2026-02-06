// Request logger middleware
import type { Middleware } from "../deps.ts";

export const requestLogger: Middleware = async (ctx, next) => {
  const start = performance.now();
  const { method, url } = ctx.request;

  await next();

  const duration = performance.now() - start;
  const status = ctx.response.status;

  console.log(
    `${new Date().toISOString()} ${method} ${url.pathname} ${status} ${duration.toFixed(2)}ms`,
  );
};
