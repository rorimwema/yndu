import { IOrderRepository } from '../../../domain/ports/IOrderRepository';
import { Order, OrderStatus } from '../../../domain/aggregates/Order/Order';
import { OrderId, UserId, AddressId, ProduceItemId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/Money';
import { DeliverySlot } from '../../../domain/value-objects/DeliverySlot';
import { Quantity } from '../../../domain/value-objects/Quantity';
import { OrderItem } from '../../../domain/aggregates/Order/OrderItem';
import { DomainEvent } from '../../../domain/events/DomainEvent';
import { OrderPlaced, OrderConfirmed, OrderCancelled, OrderAssigned, OrderDelivered } from '../../../domain/events/OrderEvents';

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: any) {}

  async save(order: Order): Promise<void> {
    const events = order.getUncommittedEvents();
    const snapshot = order.toSnapshot();

    await this.db.transaction(async (trx: any) => {
      // 1. Append events to event store
      for (const event of events) {
        await trx('domain_events').insert({
          stream_id: order.id,
          stream_type: 'Order',
          version: event.version,
          event_type: event.constructor.name,
          payload: JSON.stringify(event),
          metadata: JSON.stringify({
            correlationId: event.correlationId,
            causationId: event.causationId,
          }),
        });
      }

      // 2. Update snapshot
      await trx('aggregate_snapshots')
        .insert({
          id: order.id,
          type: 'Order',
          version: order.version,
          state: JSON.stringify(snapshot),
        })
        .onConflict('id')
        .merge();

      // 3. Update read model
      await trx('orders')
        .insert(this.toReadModel(order))
        .onConflict('id')
        .merge();
    });

    order.markEventsCommitted();
  }

  async findById(id: OrderId): Promise<Order | null> {
    const events = await this.db('domain_events')
      .where({ stream_id: id, stream_type: 'Order' })
      .orderBy('version');

    if (events.length === 0) return null;

    return Order.rehydrate(events.map((e: any) => this.deserializeEvent(e)));
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.db('orders')
      .where('user_id', userId)
      .orderBy('placed_at', 'desc');

    return rows.map((row: any) => this.fromReadModel(row));
  }

  private toReadModel(order: Order): object {
    return {
      id: order.id,
      user_id: order.userId,
      status: order.status,
      total_price_cents: order.totalPrice.amount,
      delivery_date: order.deliverySlot.date,
      slot_type: order.deliverySlot.type,
      delivery_address_id: order.deliveryAddressId,
      items: JSON.stringify(order.items.map(item => ({
        produce_id: item.produceId,
        quantity_value: item.quantity.value,
        quantity_unit: item.quantity.unit,
        line_price_cents: item.linePrice.amount,
      }))),
      placed_at: new Date(),
    };
  }

  private fromReadModel(row: any): Order {
    const items = JSON.parse(row.items || '[]').map((item: any) => new OrderItem(
      item.produce_id as ProduceItemId,
      Quantity.kilograms(item.quantity_value),
      Money.fromCents(item.line_price_cents)
    ));

    return new (Order as any)({
      id: row.id as OrderId,
      userId: row.user_id as UserId,
      items,
      totalPrice: Money.fromCents(row.total_price_cents),
      deliverySlot: DeliverySlot.forDate(new Date(row.delivery_date), row.slot_type),
      deliveryAddressId: row.delivery_address_id as AddressId,
      status: row.status as OrderStatus,
      version: row.version || 1,
    });
  }

  private deserializeEvent(row: any): DomainEvent {
    const payload = JSON.parse(row.payload);
    const metadata = JSON.parse(row.metadata || '{}');
    
    switch (row.event_type) {
      case 'OrderPlaced':
        return new OrderPlaced(
          row.stream_id,
          row.version,
          payload.userId,
          payload.items.map((item: any) => ({
            produceId: item.produceId as ProduceItemId,
            quantity: Quantity.kilograms(item.quantity.value || item.quantity),
            linePrice: Money.fromCents(item.linePrice.amount || item.linePrice),
          })),
          Money.fromCents(payload.totalPrice.amount || payload.totalPrice),
          DeliverySlot.forDate(new Date(payload.deliverySlot.date), payload.deliverySlot.type),
          payload.deliveryAddressId,
          metadata
        );
      case 'OrderConfirmed':
        return new OrderConfirmed(
          row.stream_id,
          row.version,
          new Date(payload.confirmedAt),
          payload.confirmedBy,
          metadata
        );
      case 'OrderCancelled':
        return new OrderCancelled(
          row.stream_id,
          row.version,
          new Date(payload.cancelledAt),
          payload.reason,
          payload.cancelledBy,
          metadata
        );
      case 'OrderAssigned':
        return new OrderAssigned(
          row.stream_id,
          row.version,
          payload.riderId,
          new Date(payload.assignedAt),
          metadata
        );
      case 'OrderDelivered':
        return new OrderDelivered(
          row.stream_id,
          row.version,
          new Date(payload.deliveredAt),
          payload.deliveryProof,
          metadata
        );
      default:
        throw new Error(`Unknown event type: ${row.event_type}`);
    }
  }
}
