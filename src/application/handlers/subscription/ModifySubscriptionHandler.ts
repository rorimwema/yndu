import { DomainError, Result } from '../../../shared/Result.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import { ModifySubscriptionCommand } from '../../commands/subscription/index.ts';
import { IEventPublisher, ISubscriptionRepository } from '../../../domain/ports/index.ts';
import { SubscriptionId } from '../../../domain/value-objects/branded.ts';
import { DeliverySlot } from '../../../domain/value-objects/DeliverySlot.ts';
import { Money } from '../../../domain/value-objects/Money.ts';
import { BillingCycleVO as _BillingCycleVO } from '../../../domain/value-objects/BillingCycle.ts';
import { SubscriptionPlan } from '../../../domain/value-objects/SubscriptionPlan.ts';
import { SubscriptionNotFoundError } from './CreateSubscriptionHandler.ts';

export class ModifySubscriptionHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(command: ModifySubscriptionCommand): Promise<Result<Subscription, DomainError>> {
    const subscription = await this.subscriptionRepository.findById(
      SubscriptionId(command.subscriptionId),
    );

    if (!subscription) {
      return Result.fail(new SubscriptionNotFoundError(command.subscriptionId));
    }

    try {
      switch (command.modificationType) {
        case 'PLAN': {
          if (!command.newPlanName || command.newPlanPriceCents === undefined) {
            return Result.fail(
              new DomainError(
                'Plan name and price are required',
                'VALIDATION.ERROR',
              ),
            );
          }
          const newPlan = SubscriptionPlan.create({
            name: command.newPlanName,
            price: Money.fromCents(command.newPlanPriceCents),
            items: command.newItems ?? [],
          });
          subscription.modifyPlan(newPlan);
          break;
        }

        case 'BILLING_CYCLE':
          if (!command.newBillingCycle) {
            return Result.fail(
              new DomainError(
                'Billing cycle is required',
                'VALIDATION.ERROR',
              ),
            );
          }
          subscription.modifyBillingCycle(command.newBillingCycle);
          break;

        case 'DELIVERY_SLOT': {
          if (!command.newDeliveryDate) {
            return Result.fail(
              new DomainError(
                'Delivery date is required',
                'VALIDATION.ERROR',
              ),
            );
          }
          const newSlot = DeliverySlot.create(command.newDeliveryDate);
          subscription.modifyDeliverySlot(newSlot);
          break;
        }

        default:
          return Result.fail(
            new DomainError(
              `Unknown modification type: ${command.modificationType}`,
              'VALIDATION.ERROR',
            ),
          );
      }
    } catch (error) {
      return Result.fail(
        new DomainError(
          (error as Error).message,
          'SUBSCRIPTION.MODIFY_ERROR',
        ),
      );
    }

    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll(subscription.getUncommittedEvents());

    return Result.ok(subscription);
  }
}
