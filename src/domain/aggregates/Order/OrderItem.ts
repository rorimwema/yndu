import { Money } from '../../value-objects/Money';
import { Quantity } from '../../value-objects/Quantity';
import { ProduceItemId } from '../../value-objects/branded';

export class OrderItem {
  constructor(
    readonly produceId: ProduceItemId,
    readonly quantity: Quantity,
    readonly linePrice: Money
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
