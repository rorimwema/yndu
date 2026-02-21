import { DomainError, Result } from '../../../shared/Result.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import { PauseSubscriptionCommand } from '../../commands/subscription/index.ts';
import { IEventPublisher, ISubscriptionRepository } from '../../../domain/ports/index.ts';
import { SubscriptionId } from '../../../domain/value-objects/branded.ts';
import {
  SubscriptionAlreadyPausedError,
  SubscriptionNotActiveError,
  SubscriptionNotFoundError,
} from './CreateSubscriptionHandler.ts';

export class PauseSubscriptionHandler {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private eventPublisher: IEventPublisher,
  ) {}

  async execute(command: PauseSubscriptionCommand): Promise<Result<Subscription, DomainError>> {
    const subscription = await this.subscriptionRepository.findById(
      SubscriptionId(command.subscriptionId),
    );

    if (!subscription) {
      return Result.fail(new SubscriptionNotFoundError(command.subscriptionId));
    }

    if (subscription.status !== 'ACTIVE') {
      return Result.fail(
        new SubscriptionNotActiveError(command.subscriptionId, subscription.status),
      );
    }

    try {
      subscription.pause(command.reason, command.resumeDate);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot pause')) {
        return Result.fail(new SubscriptionAlreadyPausedError(command.subscriptionId));
      }
      throw error;
    }

    await this.subscriptionRepository.save(subscription);
    await this.eventPublisher.publishAll(subscription.getUncommittedEvents());

    return Result.ok(subscription);
  }
}
