import { DomainError, Result } from '../../../shared/Result.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import { CancelSubscriptionCommand } from '../../commands/subscription/index.ts';
import { IEventPublisher, ISubscriptionRepository } from '../../../domain/ports/index.ts';
import { SubscriptionId } from '../../../domain/value-objects/branded.ts';
import { SubscriptionNotFoundError } from './CreateSubscriptionHandler.ts';

export class CancelSubscriptionHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(command: CancelSubscriptionCommand): Promise<Result<Subscription, DomainError>> {
    const subscription = await this.subscriptionRepository.findById(
      SubscriptionId(command.subscriptionId),
    );

    if (!subscription) {
      return Result.fail(new SubscriptionNotFoundError(command.subscriptionId));
    }

    try {
      subscription.cancel(command.reason);
    } catch (error) {
      return Result.fail(
        new DomainError(
          (error as Error).message,
          'SUBSCRIPTION.CANCEL_ERROR',
        ),
      );
    }

    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll(subscription.getUncommittedEvents());

    return Result.ok(subscription);
  }
}
