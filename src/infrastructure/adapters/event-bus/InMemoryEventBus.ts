import { IEventPublisher } from '../../../domain/ports/IEventPublisher.ts';
import { DomainEvent, EventHandler } from '../../../domain/events/DomainEvent.ts';

export class InMemoryEventBus implements IEventPublisher {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.constructor.name) ?? [];

    await Promise.all(
      handlers.map((handler) =>
        handler(event).catch((err) => {
          console.error(`Event handler failed for ${event.constructor.name}:`, err);
        })
      ),
    );
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((e) => this.publish(e)));
  }
}
