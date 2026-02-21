// Order route handlers
import type { Context } from "../../deps.ts";
import { getContainer } from "../../infrastructure/container.ts";
import { mapErrorToHttpStatus, Result } from "../../shared/Result.ts";
import { PlaceOrderCommand } from "../../application/commands/PlaceOrderCommand.ts";
import { Quantity } from "../../domain/value-objects/Quantity.ts";
import { UserId, AddressId, ProduceItemId } from "../../domain/value-objects/branded.ts";

export async function getOrders(ctx: Context) {
  try {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const container = getContainer();
    const result = await container.getUserOrdersHandler.execute({
      userId: userId || '',
      status: status || undefined,
      limit,
      offset,
    });

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = { error: result.getError().message };
      return;
    }

    ctx.response.body = {
      orders: result.getValue().map(order => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalPrice: order.totalPrice.toDTO(),
        deliverySlot: order.deliverySlot.toDTO(),
        createdAt: order.placedAt?.toISOString(),
      })),
      pagination: { limit, offset, total: result.getValue().length },
    };
  } catch (_error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch orders" };
  }
}

export async function getOrderById(ctx: Context) {
  try {
    const id = ctx.params.id;

    const container = getContainer();
    const result = await container.orderRepository.findById(id as any);

    if (!result) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }

    ctx.response.body = {
      order: {
        id: result.id,
        userId: result.userId,
        status: result.status,
        totalPrice: result.totalPrice.toDTO(),
        deliverySlot: result.deliverySlot.toDTO(),
        items: result.items.map(item => ({
          produceId: item.produceId,
          quantity: item.quantity.toDTO(),
          linePrice: item.linePrice.toDTO(),
        })),
      },
    };
  } catch (_error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch order" };
  }
}

export async function createOrder(ctx: Context) {
  try {
    const body = ctx.state.validatedBody;
    
    const command: PlaceOrderCommand = {
      userId: body.userId as UserId,
      items: body.items.map((item: any) => ({
        produceId: item.produceId as ProduceItemId,
        quantity: Quantity.kilograms(item.quantity),
      })),
      deliveryAddressId: body.deliveryAddressId as AddressId,
      preferredDeliveryDate: new Date(body.preferredDeliveryDate),
      isSubscription: body.isSubscription || false,
      subscriptionFrequency: body.subscriptionFrequency,
    };

    const container = getContainer();
    const result = await container.placeOrderHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = { 
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const order = result.getValue();
    ctx.response.status = 201;
    ctx.response.body = {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalPrice: order.totalPrice.toDTO(),
      deliverySlot: order.deliverySlot.toDTO(),
      createdAt: new Date().toISOString(),
    };
  } catch (_error) {
    console.error('Create order error:', _error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to create order" };
  }
}

export async function updateOrderStatus(ctx: Context) {
  try {
    const id = ctx.params.id;
    const body = await ctx.request.body.json();

    const container = getContainer();
    const order = await container.orderRepository.findById(id as any);

    if (!order) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Order not found" };
      return;
    }

    const { status, reason, confirmedBy, riderId, deliveryProof } = body;

    switch (status) {
      case 'CONFIRMED':
        order.confirm(confirmedBy || 'system');
        break;
      case 'CANCELLED':
        order.cancel(reason || 'Cancelled by user', 'user');
        break;
      case 'ASSIGNED':
        if (!riderId) {
          ctx.response.status = 400;
          ctx.response.body = { error: "riderId required for assignment" };
          return;
        }
        order.assignRider(riderId);
        break;
      case 'DISPATCHED':
        order.markAsDispatched();
        break;
      case 'DELIVERED':
        order.markDelivered(deliveryProof);
        break;
      default:
        ctx.response.status = 400;
        ctx.response.body = { error: `Invalid status: ${status}` };
        return;
    }

    await container.orderRepository.save(order);
    await container.eventBus.publishAll(order.getUncommittedEvents());

    ctx.response.body = {
      id: order.id,
      status: order.status,
      version: order.version,
      updatedAt: new Date().toISOString(),
    };
  } catch (_error) {
    console.error('Update order status error:', _error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to update order status" };
  }
}
