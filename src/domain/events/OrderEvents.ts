import { DomainEvent, EventMetadata } from './DomainEvent.ts';
import { Money } from '../value-objects/Money.ts';
import { DeliverySlot } from '../value-objects/DeliverySlot.ts';
import { Quantity } from '../value-objects/Quantity.ts';
import { ProduceItemId, UserId } from '../value-objects/branded.ts';

export interface OrderItemData {
  produceId: ProduceItemId;
  quantity: Quantity;
  linePrice: Money;
}

export class OrderPlaced extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly userId: UserId,
    readonly items: OrderItemData[],
    readonly totalPrice: Money,
    readonly deliverySlot: DeliverySlot,
    readonly deliveryAddressId: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderConfirmed extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly confirmedAt: Date,
    readonly confirmedBy: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderCancelled extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly cancelledAt: Date,
    readonly reason: string,
    readonly cancelledBy: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderAssigned extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly riderId: string,
    readonly assignedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderDispatched extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly dispatchedAt: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class OrderDelivered extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly deliveredAt: Date,
    readonly deliveryProof?: {
      photoUrl?: string;
      signature?: string;
      notes?: string;
    },
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}
