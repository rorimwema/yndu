import { DomainEvent } from '../../events/DomainEvent.ts';
import {
  OrderGeneratedFromSubscription,
  SubscriptionCancelled,
  SubscriptionCreated,
  SubscriptionExpired,
  SubscriptionModified,
  SubscriptionPaused,
  SubscriptionRenewed,
  SubscriptionResumed,
  SubscriptionStatus,
} from '../../events/SubscriptionEvents.ts';
import { Money as _Money } from '../../value-objects/Money.ts';
import { DeliverySlot } from '../../value-objects/DeliverySlot.ts';
import { BillingCycle, BillingCycleVO } from '../../value-objects/BillingCycle.ts';
import {
  SubscriptionItemVO as _SubscriptionItemVO,
  SubscriptionPlan,
} from '../../value-objects/SubscriptionPlan.ts';
import { PauseRecord, PauseRecordData } from '../../value-objects/PauseRecord.ts';
import { AddressId, OrderId, SubscriptionId, UserId } from '../../value-objects/branded.ts';

export interface SubscriptionItem {
  produceId: string;
  quantity: number;
  unit: string;
}

export interface SubscriptionProps {
  id?: SubscriptionId;
  userId: UserId;
  plan: SubscriptionPlan;
  billingCycle: BillingCycleVO;
  deliverySlot: DeliverySlot;
  deliveryAddressId: AddressId;
  items: SubscriptionItem[];
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  nextBillingDate?: Date;
  pauseHistory?: PauseRecordData[];
  version?: number;
}

export class Subscription {
  private uncommittedEvents: DomainEvent[] = [];

  readonly id: SubscriptionId;
  readonly userId: UserId;
  readonly plan: SubscriptionPlan;
  readonly billingCycle: BillingCycleVO;
  readonly deliverySlot: DeliverySlot;
  readonly deliveryAddressId: AddressId;
  readonly items: SubscriptionItem[];
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  pauseHistory: PauseRecord[];
  version: number;

  private constructor(props: SubscriptionProps) {
    this.id = props.id ?? crypto.randomUUID() as SubscriptionId;
    this.userId = props.userId;
    this.plan = props.plan;
    this.billingCycle = props.billingCycle;
    this.deliverySlot = props.deliverySlot;
    this.deliveryAddressId = props.deliveryAddressId;
    this.items = props.items;
    this.status = props.status ?? 'ACTIVE';
    this.currentPeriodStart = props.currentPeriodStart ?? new Date();
    this.currentPeriodEnd = props.currentPeriodEnd ?? this.calculatePeriodEnd();
    this.nextBillingDate = props.nextBillingDate ?? this.billingCycle.getNextBillingDate();
    this.pauseHistory = props.pauseHistory?.map((p) => PauseRecord.fromDTO(p)) ?? [];
    this.version = props.version ?? 0;
  }

  private calculatePeriodEnd(): Date {
    const end = new Date(this.currentPeriodStart);
    end.setDate(end.getDate() + this.billingCycle.getDays());
    return end;
  }

  static create(
    props: Omit<SubscriptionProps, 'id' | 'status' | 'version' | 'pauseHistory'>,
  ): Subscription {
    const subscription = new Subscription(props);

    const _periodEnd = subscription.calculatePeriodEnd();
    const nextBilling = subscription.billingCycle.getNextBillingDate();

    const event = new SubscriptionCreated(
      subscription.id,
      subscription.version + 1,
      subscription.userId,
      subscription.plan.name,
      subscription.plan.price,
      subscription.billingCycle.value,
      subscription.deliverySlot,
      subscription.items,
      nextBilling,
    );

    subscription.applyEvent(event);
    return subscription;
  }

  pause(reason: string, resumeDate?: Date): void {
    if (this.status !== 'ACTIVE') {
      throw new Error(`Cannot pause subscription in ${this.status} status`);
    }

    const pauseRecord = PauseRecord.create(reason, resumeDate);
    this.pauseHistory.push(pauseRecord);

    const event = new SubscriptionPaused(
      this.id,
      this.version + 1,
      reason,
      resumeDate ?? null,
      new Date(),
    );

    this.applyEvent(event);
  }

  resume(): void {
    if (this.status !== 'PAUSED') {
      throw new Error(`Cannot resume subscription in ${this.status} status`);
    }

    const activePause = this.pauseHistory.find((p) => p.isActive());
    if (activePause) {
      activePause.endDate = new Date();
    }

    const event = new SubscriptionResumed(
      this.id,
      this.version + 1,
      new Date(),
    );

    this.applyEvent(event);
  }

  cancel(reason: string): void {
    if (['CANCELLED', 'EXPIRED'].includes(this.status)) {
      throw new Error(`Cannot cancel subscription in ${this.status} status`);
    }

    const event = new SubscriptionCancelled(
      this.id,
      this.version + 1,
      reason,
      new Date(),
    );

    this.applyEvent(event);
  }

  modifyPlan(newPlan: SubscriptionPlan): void {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') {
      throw new Error(`Cannot modify plan for subscription in ${this.status} status`);
    }

    const oldPlanName = this.plan.name;
    this.plan = newPlan;

    const event = new SubscriptionModified(
      this.id,
      this.version + 1,
      'PLAN',
      oldPlanName,
      newPlan.name,
      new Date(),
    );

    this.applyEvent(event);
  }

  modifyBillingCycle(newCycle: BillingCycle): void {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') {
      throw new Error(`Cannot modify billing cycle for subscription in ${this.status} status`);
    }

    const oldCycle = this.billingCycle.value;
    this.billingCycle = BillingCycleVO.create(newCycle);
    this.nextBillingDate = this.billingCycle.getNextBillingDate();
    this.currentPeriodEnd = this.calculatePeriodEnd();

    const event = new SubscriptionModified(
      this.id,
      this.version + 1,
      'BILLING_CYCLE',
      oldCycle,
      newCycle,
      new Date(),
    );

    this.applyEvent(event);
  }

  modifyDeliverySlot(newDeliverySlot: DeliverySlot): void {
    const oldSlot = JSON.stringify({
      date: this.deliverySlot.date,
      type: this.deliverySlot.type,
    });
    this.deliverySlot = newDeliverySlot;

    const event = new SubscriptionModified(
      this.id,
      this.version + 1,
      'DELIVERY_SLOT',
      oldSlot,
      JSON.stringify({
        date: newDeliverySlot.date,
        type: newDeliverySlot.type,
      }),
      new Date(),
    );

    this.applyEvent(event);
  }

  renew(): void {
    const previousPeriodEnd = this.currentPeriodEnd;
    this.currentPeriodStart = new Date();
    this.currentPeriodEnd = this.calculatePeriodEnd();
    this.nextBillingDate = this.billingCycle.getNextBillingDate();

    const event = new SubscriptionRenewed(
      this.id,
      this.version + 1,
      previousPeriodEnd,
      this.currentPeriodEnd,
      this.nextBillingDate,
      new Date(),
    );

    this.applyEvent(event);
  }

  generateOrder(orderId: OrderId): void {
    if (this.status !== 'ACTIVE') {
      throw new Error(`Cannot generate order from subscription in ${this.status} status`);
    }

    const event = new OrderGeneratedFromSubscription(
      orderId,
      this.version + 1,
      this.id,
      orderId,
      new Date(),
    );

    this.applyEvent(event);
  }

  expire(reason: string): void {
    if (['CANCELLED', 'EXPIRED'].includes(this.status)) {
      throw new Error(`Cannot expire subscription in ${this.status} status`);
    }

    const event = new SubscriptionExpired(
      this.id,
      this.version + 1,
      new Date(),
      reason,
    );

    this.applyEvent(event);
  }

  private applyEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.version = event.version;

    if (event instanceof SubscriptionPaused) {
      this.status = 'PAUSED';
    } else if (event instanceof SubscriptionResumed) {
      this.status = 'ACTIVE';
    } else if (event instanceof SubscriptionCancelled) {
      this.status = 'CANCELLED';
    } else if (event instanceof SubscriptionExpired) {
      this.status = 'EXPIRED';
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsCommitted(): void {
    this.uncommittedEvents = [];
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isPaused(): boolean {
    return this.status === 'PAUSED';
  }

  shouldAutoRenew(): boolean {
    return this.status === 'ACTIVE';
  }

  toSnapshot(): object {
    return {
      id: this.id,
      userId: this.userId,
      plan: this.plan.toDTO(),
      billingCycle: this.billingCycle.value,
      deliverySlot: {
        date: this.deliverySlot.date,
        type: this.deliverySlot.type,
      },
      deliveryAddressId: this.deliveryAddressId,
      items: this.items,
      status: this.status,
      currentPeriodStart: this.currentPeriodStart.toISOString(),
      currentPeriodEnd: this.currentPeriodEnd.toISOString(),
      nextBillingDate: this.nextBillingDate.toISOString(),
      pauseHistory: this.pauseHistory.map((p) => p.toDTO()),
      version: this.version,
    };
  }
}
