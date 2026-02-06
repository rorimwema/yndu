// Routes module - exports all route handlers
import { OakRouter } from "../deps.ts";
import { ordersRouter } from "./orders/mod.ts";
import { inventoryRouter } from "./inventory/mod.ts";
import { usersRouter } from "./users/mod.ts";
import { healthRouter } from "./health/mod.ts";

export function createRouter(): OakRouter {
  const router = new OakRouter();

  // Health check
  router.use("/health", healthRouter.routes());

  // API routes
  router.use("/api/orders", ordersRouter.routes());
  router.use("/api/inventory", inventoryRouter.routes());
  router.use("/api/users", usersRouter.routes());

  // GraphQL endpoint
  router.post("/graphql", async (ctx) => {
    const body = await ctx.request.body.json();
    // GraphQL handler implementation
    ctx.response.body = { data: null };
  });

  // 404 handler
  router.all("/(.*)", (ctx) => {
    ctx.response.status = 404;
    ctx.response.body = {
      error: "Not Found",
      message: `Route ${ctx.request.url.pathname} not found`,
    };
  });

  return router;
}
