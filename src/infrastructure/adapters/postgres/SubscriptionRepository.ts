import { ISubscriptionRepository } from '../../../domain/ports/ISubscriptionRepository.ts';
import { Subscription } from '../../../domain/aggregates/Subscription/Subscription.ts';
import { AddressId, SubscriptionId, UserId } from '../../../domain/value-objects/branded.ts';
import { Money } from '../../../domain/value-objects/Money.ts';
import { DeliverySlot } from '../../../domain/value-objects/DeliverySlot.ts';
import { BillingCycleVO } from '../../../domain/value-objects/BillingCycle.ts';
import { SubscriptionPlan } from '../../../domain/value-objects/SubscriptionPlan.ts';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_name: string;
  plan_description: string;
  plan_price_cents: number;
  billing_cycle: string;
  status: string;
  delivery_slot_date: string;
  delivery_slot_type: string;
  delivery_address_id: string;
  items: string;
  current_period_start: Date;
  current_period_end: Date;
  next_billing_date: Date;
  pause_history: string;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresSubscriptionRepository implements ISubscriptionRepository {
  constructor(private db: unknown) {}

  async save(subscription: Subscription): Promise<void> {
    const _snapshot = subscription.toSnapshot();

    const exists = await this.db('subscriptions')
      .where({ id: subscription.id })
      .first();

    const data = {
      id: subscription.id,
      user_id: subscription.userId,
      plan_name: subscription.plan.name,
      plan_description: subscription.plan.description,
      plan_price_cents: subscription.plan.price.amount,
      billing_cycle: subscription.billingCycle.value,
      status: subscription.status,
      delivery_slot_date: subscription.deliverySlot.date.toISOString().split('T')[0],
      delivery_slot_type: subscription.deliverySlot.type,
      delivery_address_id: subscription.deliveryAddressId,
      items: JSON.stringify(subscription.items),
      current_period_start: subscription.currentPeriodStart,
      current_period_end: subscription.currentPeriodEnd,
      next_billing_date: subscription.nextBillingDate,
      pause_history: JSON.stringify(subscription.pauseHistory.map((p) => p.toDTO())),
      version: subscription.version,
      updated_at: new Date(),
    };

    if (exists) {
      await this.db('subscriptions')
        .where({ id: subscription.id })
        .update(data);
    } else {
      data.created_at = new Date();
      await this.db('subscriptions').insert(data);
    }
  }

  async findById(id: SubscriptionId): Promise<Subscription | null> {
    const row = await this.db('subscriptions')
      .where({ id: id })
      .first();

    if (!row) return null;

    return this.rowToSubscription(row);
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const rows = await this.db('subscriptions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    return rows.map((row) => this.rowToSubscription(row));
  }

  async findActive(): Promise<Subscription[]> {
    const rows = await this.db('subscriptions')
      .where({ status: 'ACTIVE' })
      .orderBy('next_billing_date', 'asc');

    return rows.map((row) => this.rowToSubscription(row));
  }

  async findByStatus(status: string): Promise<Subscription[]> {
    const rows = await this.db('subscriptions')
      .where({ status: status })
      .orderBy('created_at', 'desc');

    return rows.map((row) => this.rowToSubscription(row));
  }

  async findByNextBillingDate(date: Date): Promise<Subscription[]> {
    const dateStr = date.toISOString().split('T')[0];
    const rows = await this.db('subscriptions')
      .where({ status: 'ACTIVE' })
      .whereRaw('DATE(next_billing_date) <= ?', [dateStr])
      .orderBy('next_billing_date', 'asc');

    return rows.map((row) => this.rowToSubscription(row));
  }

  private rowToSubscription(row: SubscriptionRow): Subscription {
    const plan = SubscriptionPlan.create({
      name: row.plan_name,
      description: row.plan_description,
      price: Money.fromCents(row.plan_price_cents),
      items: [],
    });

    const billingCycle = BillingCycleVO.create(row.billing_cycle);
    const deliverySlot = DeliverySlot.create(new Date(row.delivery_slot_date));
    if (row.delivery_slot_type) {
      (deliverySlot as { type: string }).type = row.delivery_slot_type;
    }

    return new Subscription({
      id: row.id as SubscriptionId,
      userId: row.user_id as UserId,
      plan,
      billingCycle,
      deliverySlot,
      deliveryAddressId: row.delivery_address_id as AddressId,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      status: row.status as Subscription['status'],
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      nextBillingDate: row.next_billing_date,
      pauseHistory: typeof row.pause_history === 'string'
        ? JSON.parse(row.pause_history)
        : row.pause_history,
      version: row.version,
    });
  }
}
