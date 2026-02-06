// Domain value objects converted for Deno
// Using native Deno crypto for UUID generation

// Branded types for type safety
export type Brand<K, T> = K & { __brand: T };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;
export type ProduceItemId = Brand<string, "ProduceItemId">;
export type RiderId = Brand<string, "RiderId">;

// Validation functions
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function UserId(id: string): UserId {
  if (!isValidUUID(id)) throw new Error(`Invalid UserId: ${id}`);
  return id as UserId;
}

export function OrderId(id: string): OrderId {
  if (!isValidUUID(id)) throw new Error(`Invalid OrderId: ${id}`);
  return id as OrderId;
}

export function ProduceItemId(id: string): ProduceItemId {
  if (!isValidUUID(id)) throw new Error(`Invalid ProduceItemId: ${id}`);
  return id as ProduceItemId;
}

// Money value object
export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: "KES" = "KES",
  ) {
    if (!Number.isInteger(amount)) {
      throw new Error("Money amount must be an integer (cents)");
    }
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static fromShillings(shillings: number): Money {
    return new Money(Math.round(shillings * 100));
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  toShillings(): number {
    return this.amount / 100;
  }

  toDisplay(): string {
    return `KES ${this.toShillings().toFixed(2)}`;
  }
}
