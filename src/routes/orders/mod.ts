// Orders routes
import { Router } from '../../deps.ts';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from './handlers.ts';
import { validateCreateOrder } from './validators.ts';

export const ordersRouter = new Router();

// GET /api/orders
ordersRouter.get('/', getOrders);

// GET /api/orders/:id
ordersRouter.get('/:id', getOrderById);

// POST /api/orders
ordersRouter.post('/', validateCreateOrder, createOrder);

// PUT /api/orders/:id/status
ordersRouter.put('/:id/status', updateOrderStatus);
