import { DomainError, Result } from '../../../shared/Result.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import {
  GenerateOrderFromSubscriptionCommand,
  ProcessSubscriptionRenewalCommand,
} from '../../commands/subscription/index.ts';
import {
  IEventPublisher,
  IInventoryRepository,
  IOrderRepository,
  ISubscriptionRepository,
} from '../../../domain/ports/index.ts';
import { OrderId, SubscriptionId } from '../../../domain/value-objects/branded.ts';
import {
  SubscriptionNotActiveError,
  SubscriptionNotFoundError,
} from './CreateSubscriptionHandler.ts';
import { Order } from '../../../domain/aggregates/Order/Order.ts';
import { OrderItem } from '../../../domain/aggregates/Order/OrderItem.ts';
import { Money } from '../../../domain/value-objects/Money.ts';
import { Quantity } from '../../../domain/value-objects/Quantity.ts';
import { DeliverySlot as _DeliverySlot } from '../../../domain/value-objects/DeliverySlot.ts';

export class ProcessSubscriptionRenewalHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(
    command: ProcessSubscriptionRenewalCommand,
  ): Promise<Result<Subscription, DomainError>> {
    const subscription = await this.subscriptionRepository.findById(
      SubscriptionId(command.subscriptionId),
    );

    if (!subscription) {
      return Result.fail(new SubscriptionNotFoundError(command.subscriptionId));
    }

    if (!subscription.shouldAutoRenew()) {
      return Result.fail(
        new SubscriptionNotActiveError(
          command.subscriptionId,
          subscription.status,
        ),
      );
    }

    try {
      subscription.renew();
    } catch (error) {
      return Result.fail(
        new DomainError(
          (error as Error).message,
          'SUBSCRIPTION.RENEW_ERROR',
        ),
      );
    }

    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll(subscription.getUncommittedEvents());

    return Result.ok(subscription);
  }
}

export class GenerateOrderFromSubscriptionHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private orderRepository: IOrderRepository,
    private inventoryRepository: IInventoryRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(
    command: GenerateOrderFromSubscriptionCommand,
  ): Promise<Result<Order, DomainError>> {
    const subscription = await this.subscriptionRepository.findById(
      SubscriptionId(command.subscriptionId),
    );

    if (!subscription) {
      return Result.fail(new SubscriptionNotFoundError(command.subscriptionId));
    }

    if (!subscription.isActive()) {
      return Result.fail(
        new SubscriptionNotActiveError(
          command.subscriptionId,
          subscription.status,
        ),
      );
    }

    const orderItems: OrderItem[] = [];
    for (const item of subscription.items) {
      const produceItem = await this.inventoryRepository.findById(item.produceId as string);
      if (!produceItem) continue;

      if (!produceItem.hasSufficientStock(Quantity.fromKilograms(item.quantity))) {
        continue;
      }

      const linePrice = produceItem.unitPrice.multiply(item.quantity);
      orderItems.push(
        new OrderItem(
          item.produceId as string,
          Quantity.fromKilograms(item.quantity),
          linePrice,
        ),
      );
    }

    if (orderItems.length === 0) {
      return Result.fail(
        new DomainError(
          'No items available for order generation',
          'SUBSCRIPTION.NO_ITEMS',
        ),
      );
    }

    const totalPrice = orderItems.reduce(
      (sum, item) => sum.add(item.linePrice),
      Money.fromCents(0),
    );

    const order = Order.create({
      userId: subscription.userId,
      items: orderItems,
      totalPrice,
      deliverySlot: subscription.deliverySlot,
      deliveryAddressId: subscription.deliveryAddressId,
    });

    subscription.generateOrder(order.id as OrderId);

    await this.orderRepository.save(order);
    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll([
      ...order.getUncommittedEvents(),
      ...subscription.getUncommittedEvents(),
    ]);

    return Result.ok(order);
  }
}
