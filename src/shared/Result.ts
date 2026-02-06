// Result type for functional error handling
// Deno-native implementation

export class Result<T, E> {
  private constructor(
    private readonly success: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }

  getValue(): T {
    if (!this.success) throw new Error("Cannot get value from failed result");
    return this.value!;
  }

  getError(): E {
    if (this.success) throw new Error("Cannot get error from successful result");
    return this.error!;
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.success ? Result.ok(fn(this.value!)) : Result.fail(this.error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.success ? fn(this.value!) : Result.fail(this.error!);
  }
}

export abstract class DomainError extends Error {
  constructor(
    readonly message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class InsufficientStockError extends DomainError {
  constructor(
    readonly produceId: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super(
      `Insufficient stock for ${produceId}. Requested: ${requested}, Available: ${available}`,
      "INVENTORY.INSUFFICIENT_STOCK",
    );
  }
}
