import { ISubscriptionRepository } from '../../domain/ports/index.ts';
import { Subscription } from '../../domain/aggregates/Subscription/Subscription.ts';

export interface GetUserSubscriptionsQuery {
  userId: string;
}

export interface GetSubscriptionByIdQuery {
  subscriptionId: string;
}

export interface GetActiveSubscriptionsQuery {
  limit?: number;
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  planName: string;
  planPriceCents: number;
  billingCycle: string;
  status: string;
  deliverySlot: {
    date: string;
    type: string;
  };
  items: Array<{
    produceId: string;
    quantity: number;
    unit: string;
  }>;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  pauseHistory: Array<{
    startDate: string;
    endDate?: string;
    reason: string;
  }>;
}

export class GetUserSubscriptionsHandler {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(query: GetUserSubscriptionsQuery): Promise<SubscriptionDTO[]> {
    const subscriptions = await this.subscriptionRepository.findByUserId(query.userId);
    return subscriptions.map((sub) => this.toDTO(sub));
  }

  private toDTO(subscription: Subscription): SubscriptionDTO {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planName: subscription.plan.name,
      planPriceCents: subscription.plan.price.amount,
      billingCycle: subscription.billingCycle.value,
      status: subscription.status,
      deliverySlot: {
        date: subscription.deliverySlot.date.toISOString(),
        type: subscription.deliverySlot.type,
      },
      items: subscription.items,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      pauseHistory: subscription.pauseHistory.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString(),
        reason: p.reason,
      })),
    };
  }
}

export class GetSubscriptionByIdHandler {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(query: GetSubscriptionByIdQuery): Promise<SubscriptionDTO | null> {
    const subscriptions = await this.subscriptionRepository.findByUserId(query.subscriptionId);
    const subscription = subscriptions.find((s) => s.id === query.subscriptionId);
    if (!subscription) return null;

    return {
      id: subscription.id,
      userId: subscription.userId,
      planName: subscription.plan.name,
      planPriceCents: subscription.plan.price.amount,
      billingCycle: subscription.billingCycle.value,
      status: subscription.status,
      deliverySlot: {
        date: subscription.deliverySlot.date.toISOString(),
        type: subscription.deliverySlot.type,
      },
      items: subscription.items,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      pauseHistory: subscription.pauseHistory.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString(),
        reason: p.reason,
      })),
    };
  }
}
