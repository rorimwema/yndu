import { Money } from '../../value-objects/Money.ts';
import { Quantity } from '../../value-objects/Quantity.ts';
import { ProduceItemId } from '../../value-objects/branded.ts';

export class OrderItem {
  constructor(
    readonly produceId: ProduceItemId,
    readonly quantity: Quantity,
    readonly linePrice: Money,
  ) {}

  get weight(): number {
    return this.quantity.toKilograms();
  }

  toJSON() {
    return {
      produceId: this.produceId,
      quantity: this.quantity.toDisplay(),
      linePrice: this.linePrice.toDisplay(),
    };
  }
}
