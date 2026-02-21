import { Subscription } from '../aggregates/Subscription/Subscription.ts';
import { SubscriptionId } from '../value-objects/branded.ts';

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(id: SubscriptionId): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription[]>;
  findActive(): Promise<Subscription[]>;
  findByStatus(status: string): Promise<Subscription[]>;
  findByNextBillingDate(date: Date): Promise<Subscription[]>;
}
