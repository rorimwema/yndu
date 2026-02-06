import { KES } from './branded';

export class Money {
  private constructor(
    readonly amount: KES,
    readonly currency: 'KES' = 'KES'
  ) {}

  static fromCents(cents: number): Money {
    return new Money(cents as KES);
  }

  static fromShillings(shillings: number): Money {
    return new Money((shillings * 100) as KES);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money((this.amount + other.amount) as KES, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor) as KES, this.currency);
  }

  toShillings(): number {
    return this.amount / 100;
  }

  toDisplay(): string {
    return `KES ${this.toShillings().toFixed(2)}`;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
