// Orders routes
import { OakRouter } from "../../deps.ts";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "./handlers.ts";
import { validateCreateOrder } from "./validators.ts";

export const ordersRouter = new OakRouter();

// GET /api/orders
ordersRouter.get("/", getOrders);

// GET /api/orders/:id
ordersRouter.get("/:id", getOrderById);

// POST /api/orders
ordersRouter.post("/", validateCreateOrder, createOrder);

// PUT /api/orders/:id/status
ordersRouter.put("/:id/status", updateOrderStatus);
