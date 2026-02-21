// Quantity value object
export type Unit = 'kg' | 'g' | 'pcs' | 'bunches';

export class Quantity {
  private constructor(
    readonly value: number,
    readonly unit: Unit,
  ) {
    if (value < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  static kilograms(value: number): Quantity {
    return new Quantity(value, 'kg');
  }

  static grams(value: number): Quantity {
    return new Quantity(value, 'g');
  }

  static pieces(value: number): Quantity {
    return new Quantity(value, 'pcs');
  }

  static bunches(value: number): Quantity {
    return new Quantity(value, 'bunches');
  }

  toKilograms(): number {
    switch (this.unit) {
      case 'kg':
        return this.value;
      case 'g':
        return this.value / 1000;
      default:
        throw new Error(`Cannot convert ${this.unit} to kilograms`);
    }
  }

  toDisplay(): string {
    return `${this.value} ${this.unit}`;
  }

  add(other: Quantity): Quantity {
    if (this.unit !== other.unit) {
      throw new Error(
        `Cannot add quantities with different units: ${this.unit} and ${other.unit}`,
      );
    }
    return new Quantity(this.value + other.value, this.unit);
  }
}
