// Routes module - exports all route handlers
import { Router } from '../deps.ts';
import { ordersRouter } from './orders/mod.ts';
import { inventoryRouter } from './inventory/mod.ts';
import { usersRouter } from './users/mod.ts';
import { healthRouter } from './health/mod.ts';
import subscriptionsRouter from './subscriptions/mod.ts';
import { adminRouter } from './admin/mod.ts';
import { authRouter } from './auth/mod.ts';
import { paymentsRouter } from './payments/mod.ts';
import { handleGraphQL } from '../graphql/handler.ts';

export function createRouter(): Router {
  const router = new Router();

  // Health check
  router.use('/health', healthRouter.routes());

  // Auth routes (public - no JWT required for login/register)
  router.use('/api/auth', authRouter.routes());

  // API routes
  router.use('/api/orders', ordersRouter.routes());
  router.use('/api/inventory', inventoryRouter.routes());
  router.use('/api/users', usersRouter.routes());
  router.use('/api/subscriptions', subscriptionsRouter.routes());
  router.use('/api/admin', adminRouter.routes());
  router.use('/api/payments', paymentsRouter.routes());

  // GraphQL endpoint
  router.post('/graphql', handleGraphQL);

  // 404 handler
  router.all('/(.*)', (ctx) => {
    ctx.response.status = 404;
    ctx.response.body = {
      error: 'Not Found',
      message: `Route ${ctx.request.url.pathname} not found`,
    };
  });

  return router;
}
