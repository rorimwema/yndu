import { DomainError, Result } from '../../shared/Result.ts';
import { Order } from '../../domain/aggregates/Order/Order.ts';
import { OrderItem } from '../../domain/aggregates/Order/OrderItem.ts';
import { PlaceOrderCommand } from '../commands/PlaceOrderCommand.ts';
import {
  IEventPublisher,
  IInventoryRepository,
  IOrderRepository,
  IUserRepository,
} from '../../domain/ports/index.ts';
import { DeliverySlot } from '../../domain/value-objects/DeliverySlot.ts';
import { Money as _Money } from '../../domain/value-objects/Money.ts';
import { calculateOrderTotal } from '../../domain/aggregates/Order/invariants.ts';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 'USER.NOT_FOUND');
  }
}

export class AddressNotFoundError extends DomainError {
  constructor(addressId: string) {
    super(`Address ${addressId} not found`, 'ADDRESS.NOT_FOUND');
  }
}

export class ProduceItemNotFoundError extends DomainError {
  constructor(produceId: string) {
    super(`Produce item ${produceId} not found`, 'INVENTORY.ITEM_NOT_FOUND');
  }
}

export class InsufficientStockError extends DomainError {
  constructor(produceId: string, requested: number, available: number) {
    super(
      `Insufficient stock for ${produceId}. Requested: ${requested}, Available: ${available}`,
      'INVENTORY.INSUFFICIENT_STOCK',
    );
  }
}

export class PlaceOrderHandler {
  constructor(
    private orderRepository: IOrderRepository,
    private inventoryRepository: IInventoryRepository,
    private userRepository: IUserRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<Result<Order, DomainError>> {
    // 1. Validate user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      return Result.fail(new UserNotFoundError(command.userId));
    }

    // 2. Validate address
    const address = user.addresses.find((a) => a.id === command.deliveryAddressId);
    if (!address) {
      return Result.fail(new AddressNotFoundError(command.deliveryAddressId));
    }

    // 3. Check inventory and build order items
    const orderItems: OrderItem[] = [];
    for (const item of command.items) {
      const produceItem = await this.inventoryRepository.findById(item.produceId);
      if (!produceItem) {
        return Result.fail(new ProduceItemNotFoundError(item.produceId));
      }
      if (!produceItem.hasSufficientStock(item.quantity)) {
        return Result.fail(
          new InsufficientStockError(
            item.produceId,
            item.quantity.toKilograms(),
            produceItem.availableQuantity.toKilograms(),
          ),
        );
      }

      const linePrice = produceItem.unitPrice.multiply(item.quantity.toKilograms());
      orderItems.push(new OrderItem(item.produceId, item.quantity, linePrice));
    }

    // 4. Calculate total price
    const totalPrice = calculateOrderTotal(orderItems);

    // 5. Determine delivery slot
    const deliverySlot = DeliverySlot.create(command.preferredDeliveryDate);

    // 6. Create order aggregate
    const order = Order.create({
      userId: command.userId,
      items: orderItems,
      totalPrice,
      deliverySlot,
      deliveryAddressId: command.deliveryAddressId,
    });

    // 7. Persist
    await this.orderRepository.save(order);

    // 8. Publish events
    await this.eventPublisher.publishAll(order.getUncommittedEvents());

    return Result.ok(order);
  }
}
