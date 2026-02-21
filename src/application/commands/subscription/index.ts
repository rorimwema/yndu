import { AddressId, UserId } from '../../../domain/value-objects/branded.ts';
import { BillingCycle } from '../../../domain/value-objects/BillingCycle.ts';

export interface SubscriptionItemCommand {
  produceId: string;
  quantity: number;
  unit: string;
}

export interface CreateSubscriptionCommand {
  userId: UserId;
  planName: string;
  planPriceCents: number;
  billingCycle: BillingCycle;
  deliveryAddressId: AddressId;
  preferredDeliveryDate: Date;
  items: SubscriptionItemCommand[];
}

export interface PauseSubscriptionCommand {
  subscriptionId: string;
  reason: string;
  resumeDate?: Date;
}

export interface ResumeSubscriptionCommand {
  subscriptionId: string;
}

export interface CancelSubscriptionCommand {
  subscriptionId: string;
  reason: string;
}

export interface ModifySubscriptionCommand {
  subscriptionId: string;
  modificationType: 'PLAN' | 'BILLING_CYCLE' | 'DELIVERY_SLOT' | 'ITEMS';
  newPlanName?: string;
  newPlanPriceCents?: number;
  newBillingCycle?: BillingCycle;
  newDeliveryDate?: Date;
  newItems?: SubscriptionItemCommand[];
}

export interface ProcessSubscriptionRenewalCommand {
  subscriptionId: string;
}

export interface GenerateOrderFromSubscriptionCommand {
  subscriptionId: string;
}
