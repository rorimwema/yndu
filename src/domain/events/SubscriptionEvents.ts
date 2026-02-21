import { DomainEvent, EventMetadata } from './DomainEvent.ts';
import { Money } from '../value-objects/Money.ts';
import { DeliverySlot } from '../value-objects/DeliverySlot.ts';
import { BillingCycle } from '../value-objects/BillingCycle.ts';
import { SubscriptionItemVO as _SubscriptionItemVO } from '../value-objects/SubscriptionPlan.ts';
import { SubscriptionId, UserId } from '../value-objects/branded.ts';

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionItemData {
  produceId: string;
  quantity: number;
  unit: string;
}

export class SubscriptionCreated extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly userId: UserId,
    readonly planName: string,
    readonly planPrice: Money,
    readonly billingCycle: BillingCycle,
    readonly deliverySlot: DeliverySlot,
    readonly items: SubscriptionItemData[],
    readonly nextBillingDate: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionPaused extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly reason: string,
    readonly resumeDate: Date | null,
    readonly pausedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionResumed extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly resumedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionCancelled extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly reason: string,
    readonly cancelledAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionModified extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly modificationType: 'PLAN' | 'BILLING_CYCLE' | 'DELIVERY_SLOT' | 'ITEMS',
    readonly oldValue: string,
    readonly newValue: string,
    readonly modifiedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionRenewed extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly previousPeriodEnd: Date,
    readonly newPeriodEnd: Date,
    readonly newNextBillingDate: Date,
    readonly renewedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderGeneratedFromSubscription extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly subscriptionId: SubscriptionId,
    readonly orderId: string,
    readonly generatedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class SubscriptionExpired extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly expiredAt: Date,
    readonly reason: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}
