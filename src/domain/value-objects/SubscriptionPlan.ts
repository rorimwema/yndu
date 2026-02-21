import { Money } from './Money.ts';
import { Quantity } from './Quantity.ts';
import { ProduceItemId } from './branded.ts';

export interface SubscriptionItemVO {
  produceId: ProduceItemId;
  quantity: Quantity;
}

export interface SubscriptionPlanData {
  name: string;
  description?: string;
  price: Money;
  items: SubscriptionItemVO[];
}

export class SubscriptionPlan {
  private constructor(
    readonly name: string,
    readonly description: string,
    readonly price: Money,
    readonly items: SubscriptionItemVO[],
  ) {}

  static create(data: SubscriptionPlanData): SubscriptionPlan {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Plan name is required');
    }
    if (data.items.length === 0) {
      throw new Error('Plan must have at least one item');
    }
    return new SubscriptionPlan(
      data.name,
      data.description ?? '',
      data.price,
      data.items,
    );
  }

  static createBasic(priceInCents: number): SubscriptionPlan {
    return new SubscriptionPlan(
      'Basic Box',
      'Weekly fresh produce box',
      Money.fromCents(priceInCents),
      [],
    );
  }

  getTotalItems(): number {
    return this.items.length;
  }

  toDTO(): SubscriptionPlanData & { priceCents: number } {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      items: this.items,
      priceCents: this.price.amount,
    };
  }
}
