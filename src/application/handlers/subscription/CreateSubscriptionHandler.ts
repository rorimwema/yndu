import { DomainError, Result } from '../../../shared/Result.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import { CreateSubscriptionCommand } from '../../commands/subscription/index.ts';
import {
  IEventPublisher,
  ISubscriptionRepository,
  IUserRepository,
} from '../../../domain/ports/index.ts';
import { DeliverySlot } from '../../../domain/value-objects/DeliverySlot.ts';
import { Money } from '../../../domain/value-objects/Money.ts';
import { BillingCycleVO } from '../../../domain/value-objects/BillingCycle.ts';
import { SubscriptionPlan } from '../../../domain/value-objects/SubscriptionPlan.ts';

export class SubscriptionNotFoundError extends DomainError {
  constructor(subscriptionId: string) {
    super(`Subscription ${subscriptionId} not found`, 'SUBSCRIPTION.NOT_FOUND');
  }
}

export class SubscriptionNotActiveError extends DomainError {
  constructor(subscriptionId: string, status: string) {
    super(
      `Subscription ${subscriptionId} is not active (status: ${status})`,
      'SUBSCRIPTION.NOT_ACTIVE',
    );
  }
}

export class SubscriptionAlreadyPausedError extends DomainError {
  constructor(subscriptionId: string) {
    super(`Subscription ${subscriptionId} is already paused`, 'SUBSCRIPTION.ALREADY_PAUSED');
  }
}

export class SubscriptionNotPausedError extends DomainError {
  constructor(subscriptionId: string) {
    super(`Subscription ${subscriptionId} is not paused`, 'SUBSCRIPTION.NOT_PAUSED');
  }
}

export class CreateSubscriptionHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private userRepository: IUserRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(command: CreateSubscriptionCommand): Promise<Result<Subscription, DomainError>> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      return Result.fail(new DomainError(`User ${command.userId} not found`, 'USER.NOT_FOUND'));
    }

    const address = user.addresses.find((a) => a.id === command.deliveryAddressId);
    if (!address) {
      return Result.fail(
        new DomainError(`Address ${command.deliveryAddressId} not found`, 'ADDRESS.NOT_FOUND'),
      );
    }

    const plan = SubscriptionPlan.create({
      name: command.planName,
      price: Money.fromCents(command.planPriceCents),
      items: [],
    });

    const billingCycle = BillingCycleVO.create(command.billingCycle);
    const deliverySlot = DeliverySlot.create(command.preferredDeliveryDate);

    const subscription = Subscription.create({
      userId: command.userId,
      plan,
      billingCycle,
      deliverySlot,
      deliveryAddressId: command.deliveryAddressId,
      items: command.items,
    });

    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll(subscription.getUncommittedEvents());

    return Result.ok(subscription);
  }
}
