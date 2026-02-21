import { DomainEvent, EventMetadata } from './DomainEvent.ts';
import { Quantity } from '../value-objects/Quantity.ts';
import { ProduceItemId as _ProduceItemId } from '../value-objects/branded.ts';

export class StockDecremented extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly quantity: Quantity,
    readonly reason: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class StockIncremented extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly quantity: Quantity,
    readonly reason: string,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class StockLow extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly availableQuantity: Quantity,
    readonly threshold: Quantity,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}

export class ProduceItemSeasonalityChanged extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly isSeasonal: boolean,
    readonly seasonStart?: Date,
    readonly seasonEnd?: Date,
    metadata?: EventMetadata,
  ) {
    super(aggregateId, version, metadata);
  }
}
