import { DomainEvent } from '../../events/DomainEvent';
import { OrderPlaced, OrderConfirmed, OrderCancelled, OrderAssigned, OrderDelivered } from '../../events/OrderEvents';
import { Money } from '../../value-objects/Money';
import { DeliverySlot } from '../../value-objects/DeliverySlot';
import { OrderId, UserId, AddressId } from '../../value-objects/branded';
import { OrderItem } from './OrderItem';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderProps {
  id?: OrderId;
  userId: UserId;
  items: OrderItem[];
  totalPrice: Money;
  deliverySlot: DeliverySlot;
  deliveryAddressId: AddressId;
  status?: OrderStatus;
  version?: number;
}

export class Order {
  private uncommittedEvents: DomainEvent[] = [];
  
  readonly id: OrderId;
  readonly userId: UserId;
  readonly items: OrderItem[];
  readonly totalPrice: Money;
  readonly deliverySlot: DeliverySlot;
  readonly deliveryAddressId: AddressId;
  status: OrderStatus;
  version: number;

  private constructor(props: OrderProps) {
    this.id = props.id ?? crypto.randomUUID() as OrderId;
    this.userId = props.userId;
    this.items = props.items;
    this.totalPrice = props.totalPrice;
    this.deliverySlot = props.deliverySlot;
    this.deliveryAddressId = props.deliveryAddressId;
    this.status = props.status ?? 'PENDING';
    this.version = props.version ?? 0;
  }

  static create(props: OrderProps): Order {
    const order = new Order(props);
    
    const event = new OrderPlaced(
      order.id,
      order.version + 1,
      order.userId,
      order.items.map(item => ({
        produceId: item.produceId,
        quantity: item.quantity,
        linePrice: item.linePrice,
      })),
      order.totalPrice,
      order.deliverySlot,
      order.deliveryAddressId,
    );
    
    order.applyEvent(event);
    return order;
  }

  confirm(confirmedBy: string): void {
    if (this.status !== 'PENDING') {
      throw new Error(`Cannot confirm order in ${this.status} status`);
    }
    
    const event = new OrderConfirmed(
      this.id,
      this.version + 1,
      new Date(),
      confirmedBy,
    );
    
    this.applyEvent(event);
  }

  cancel(reason: string, cancelledBy: string): void {
    if (['DELIVERED', 'CANCELLED'].includes(this.status)) {
      throw new Error(`Cannot cancel order in ${this.status} status`);
    }
    
    const event = new OrderCancelled(
      this.id,
      this.version + 1,
      new Date(),
      reason,
      cancelledBy,
    );
    
    this.applyEvent(event);
  }

  assignRider(riderId: string): void {
    if (this.status !== 'CONFIRMED') {
      throw new Error(`Cannot assign rider to order in ${this.status} status`);
    }
    
    const event = new OrderAssigned(
      this.id,
      this.version + 1,
      riderId,
      new Date(),
    );
    
    this.applyEvent(event);
  }

  markDelivered(deliveryProof?: { photoUrl?: string; signature?: string; notes?: string }): void {
    if (this.status !== 'ASSIGNED' && this.status !== 'OUT_FOR_DELIVERY') {
      throw new Error(`Cannot mark as delivered order in ${this.status} status`);
    }
    
    const event = new OrderDelivered(
      this.id,
      this.version + 1,
      new Date(),
      deliveryProof,
    );
    
    this.applyEvent(event);
  }

  private applyEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.version = event.version;

    // Update state based on event type
    if (event instanceof OrderConfirmed) {
      this.status = 'CONFIRMED';
    } else if (event instanceof OrderCancelled) {
      this.status = 'CANCELLED';
    } else if (event instanceof OrderAssigned) {
      this.status = 'ASSIGNED';
    } else if (event instanceof OrderDelivered) {
      this.status = 'DELIVERED';
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsCommitted(): void {
    this.uncommittedEvents = [];
  }

  isValid(): boolean {
    return this.items.length > 0 && this.totalPrice.toShillings() > 0;
  }

  toSnapshot(): object {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items.map(item => ({
        produceId: item.produceId,
        quantity: item.quantity,
        linePrice: item.linePrice,
      })),
      totalPrice: this.totalPrice,
      deliverySlot: {
        date: this.deliverySlot.date,
        type: this.deliverySlot.type,
      },
      deliveryAddressId: this.deliveryAddressId,
      status: this.status,
      version: this.version,
    };
  }

  static rehydrate(events: DomainEvent[]): Order {
    if (events.length === 0) {
      throw new Error('Cannot rehydrate order from empty events');
    }

    const firstEvent = events[0];
    if (!(firstEvent instanceof OrderPlaced)) {
      throw new Error('First event must be OrderPlaced');
    }

    let order = new Order({
      id: firstEvent.aggregateId as OrderId,
      userId: firstEvent.userId,
      items: firstEvent.items.map(item => new OrderItem(
        item.produceId,
        item.quantity,
        item.linePrice
      )),
      totalPrice: firstEvent.totalPrice,
      deliverySlot: firstEvent.deliverySlot,
      deliveryAddressId: firstEvent.deliveryAddressId as AddressId,
      status: 'PENDING',
      version: 0,
    });

    for (const event of events) {
      order.applyEvent(event);
    }

    order.uncommittedEvents = [];
    return order;
  }
}
