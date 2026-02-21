import { SubscriptionId as _SubscriptionId, UserId as _UserId } from '../value-objects/branded.ts';

export type BillingCycle = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export const BillingCycleDays: Record<BillingCycle, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
};

export class BillingCycleVO {
  private constructor(
    readonly value: BillingCycle,
  ) {}

  static create(value: string): BillingCycleVO {
    if (!['WEEKLY', 'BIWEEKLY', 'MONTHLY'].includes(value)) {
      throw new Error(`Invalid billing cycle: ${value}`);
    }
    return new BillingCycleVO(value as BillingCycle);
  }

  getDays(): number {
    return BillingCycleDays[this.value];
  }

  getNextBillingDate(fromDate: Date = new Date()): Date {
    const next = new Date(fromDate);
    next.setDate(next.getDate() + this.getDays());
    return next;
  }

  toString(): string {
    return this.value;
  }
}
