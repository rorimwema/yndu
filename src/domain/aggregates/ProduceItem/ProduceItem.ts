import { Money } from '../../value-objects/Money.ts';
import { Quantity } from '../../value-objects/Quantity.ts';
import { ProduceItemId } from '../../value-objects/branded.ts';

export type ProduceCategory = 'LEAFY_GREENS' | 'ROOT_VEGETABLES' | 'FRUITS' | 'HERBS';

export interface ProduceItemProps {
  id?: ProduceItemId;
  name?: string;
  nameSw?: string;
  category?: ProduceCategory;
  unitPrice?: Money;
  availableQuantity?: Quantity;
  reorderThreshold?: Quantity;
  isSeasonal?: boolean;
  seasonStart?: Date;
  seasonEnd?: Date;
  imageUrl?: string;
  isActive?: boolean;
}

export class ProduceItem {
  readonly id: ProduceItemId;
  name: string;
  nameSw?: string;
  category: ProduceCategory;
  unitPrice: Money;
  availableQuantity: Quantity;
  reorderThreshold: Quantity;
  isSeasonal: boolean;
  seasonStart?: Date;
  seasonEnd?: Date;
  imageUrl?: string;
  isActive: boolean;

  constructor(props: ProduceItemProps) {
    this.id = props.id ?? crypto.randomUUID() as ProduceItemId;
    this.name = props.name ?? '';
    this.nameSw = props.nameSw;
    this.category = props.category ?? 'LEAFY_GREENS';
    this.unitPrice = props.unitPrice ?? Money.fromCents(0);
    this.availableQuantity = props.availableQuantity ?? Quantity.kilograms(0);
    this.reorderThreshold = props.reorderThreshold ?? Quantity.kilograms(0);
    this.isSeasonal = props.isSeasonal ?? false;
    this.seasonStart = props.seasonStart;
    this.seasonEnd = props.seasonEnd;
    this.imageUrl = props.imageUrl;
    this.isActive = props.isActive ?? true;
  }

  hasSufficientStock(requested: Quantity): boolean {
    return this.availableQuantity.toKilograms() >= requested.toKilograms();
  }

  decrementStock(quantity: Quantity, _reason: string): void {
    if (!this.hasSufficientStock(quantity)) {
      throw new Error(
        `Insufficient stock. Available: ${this.availableQuantity.toDisplay()}, Requested: ${quantity.toDisplay()}`,
      );
    }
    this.availableQuantity = this.availableQuantity.add(
      Quantity.kilograms(-quantity.toKilograms()),
    );
  }

  incrementStock(quantity: Quantity, _reason: string): void {
    this.availableQuantity = this.availableQuantity.add(quantity);
  }

  isLowStock(): boolean {
    return this.availableQuantity.toKilograms() <= this.reorderThreshold.toKilograms();
  }

  updateSeasonality(isSeasonal: boolean, seasonStart?: Date, seasonEnd?: Date): void {
    this.isSeasonal = isSeasonal;
    this.seasonStart = seasonStart;
    this.seasonEnd = seasonEnd;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      nameSw: this.nameSw,
      category: this.category,
      unitPrice: this.unitPrice.toDisplay(),
      availableQuantity: this.availableQuantity.toDisplay(),
      reorderThreshold: this.reorderThreshold.toDisplay(),
      isSeasonal: this.isSeasonal,
      seasonStart: this.seasonStart,
      seasonEnd: this.seasonEnd,
      imageUrl: this.imageUrl,
    };
  }
}
