import { OrderItem } from './OrderItem.ts';
import { Money } from '../../value-objects/Money.ts';
import { Kilograms } from '../../value-objects/branded.ts';

export function calculateTotalWeight(items: OrderItem[]): number {
  return items.reduce((total, item) => total + item.weight, 0);
}

export function canAddItem(
  currentItems: OrderItem[],
  newItem: OrderItem,
  maxWeight: Kilograms,
): boolean {
  const currentWeight = calculateTotalWeight(currentItems);
  const newWeight = currentWeight + newItem.weight;
  return newWeight <= maxWeight;
}

export function calculateOrderTotal(items: OrderItem[]): Money {
  return items.reduce(
    (total, item) => total.add(item.linePrice),
    Money.fromCents(0),
  );
}

export function determineDeliverySlot(
  orderTime: Date,
  preferredDate: Date,
  inventoryAvailable: boolean,
  cutoffHour: number = 10,
): { date: Date; type: 'SAME_DAY' | 'NEXT_DAY' } {
  const cutoff = new Date(orderTime);
  cutoff.setHours(cutoffHour, 0, 0, 0);

  const isToday = preferredDate.toDateString() === orderTime.toDateString();
  const isSameDay = orderTime < cutoff &&
    isToday &&
    inventoryAvailable;

  return {
    date: preferredDate,
    type: isSameDay ? 'SAME_DAY' : 'NEXT_DAY',
  };
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export const ORDER_RULES = {
  SMALL_BOX: {
    maxWeight: 5 as Kilograms,
    basePrice: Money.fromShillings(500),
    maxItems: 8,
  },
  MEDIUM_BOX: {
    maxWeight: 10 as Kilograms,
    basePrice: Money.fromShillings(900),
    maxItems: 15,
  },
  LARGE_BOX: {
    maxWeight: 20 as Kilograms,
    basePrice: Money.fromShillings(1500),
    maxItems: 25,
  },
  SAME_DAY_CUTOFF: 10,
} as const;

export type BoxSize = 'SMALL' | 'MEDIUM' | 'LARGE';
