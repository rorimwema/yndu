// Domain events for Deno
// Using Deno's native crypto.randomUUID()

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
}

export abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly correlationId: string;
  readonly causationId: string;

  constructor(
    readonly aggregateId: string,
    readonly version: number,
    metadata?: EventMetadata,
  ) {
    this.occurredAt = new Date();
    this.correlationId = metadata?.correlationId ?? crypto.randomUUID();
    this.causationId = metadata?.causationId ?? this.correlationId;
  }

  toJSON(): object {
    return {
      aggregateId: this.aggregateId,
      version: this.version,
      occurredAt: this.occurredAt.toISOString(),
      correlationId: this.correlationId,
      causationId: this.causationId,
    };
  }
}

export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void> | void;
