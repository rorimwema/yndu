# Yndu System: Domain-Driven Design Architecture Research
## Vue 3 + TypeScript + GraphQL + PostgreSQL Stack

---

## Executive Summary

This document presents comprehensive research findings for implementing a production-ready Domain-Driven Design (DDD) architecture for the Yndu fresh produce delivery system. The architecture follows hexagonal (ports and adapters) patterns with a Vue 3/TypeScript frontend, GraphQL API layer, and PostgreSQL persistence.

---

## 1. Hexagonal Architecture with Vue 3 & TypeScript

### 1.1 Core Architecture Pattern

Based on research [^5^][^7^][^12^], the hexagonal architecture provides:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DRIVING ADAPTERS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Vue 3 UI   │  │  GraphQL    │  │  Admin Dashboard        │  │
│  │  (Mobile)   │  │  Router     │  │  (Vue/Web)              │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘  │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION CORE                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              INBOUND PORTS (Interfaces)                  │    │
│  │   IOrderService │ IInventoryService │ IUserService       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                           ▼                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │   Order     │  │  Inventory  │  │   Subscription  │    │  │
│  │  │  Aggregate  │  │  Aggregate  │  │    Aggregate    │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           DOMAIN SERVICES                           │  │  │
│  │  │  BoxPricer │ OrderValidator │ SubscriptionScheduler │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │             OUTBOUND PORTS (Interfaces)                  │    │
│  │  IOrderRepository │ IEventPublisher │ ISMSAdapter        │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                        DRIVEN ADAPTERS                          │
│  ┌─────────────────┐  ┌──────┴──────┐  ┌─────────────────────┐  │
│  │   PostgreSQL    │  │  Event Bus  │  │   SMS Gateway       │  │
│  │  (JSONB Store)  │  │  (Domain)   │  │   (Twilio/Africa's  │  │
│  │                 │  │             │  │   Talking)          │  │
│  └─────────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Vue 3 Integration with Domain Layer

Per research [^12^][^19^], Vue 3's Composition API integrates cleanly with hexagonal architecture:

```typescript
// src/infrastructure/views/vue-ui/src/views/OrderPlacement.vue
<template>
  <div class="order-placement">
    <BoxSelector @select="handleBoxSelect" />
    <DeliverySlotPicker v-model="deliverySlot" />
    <button @click="placeOrder" :disabled="!canPlaceOrder">
      Place Order
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOrderService } from '@/composables/useOrderService';
import { BoxSize, Money } from '@/domain/value-objects';

const { placeOrder: placeOrderUseCase, validator } = useOrderService();

// Domain logic through ports - UI knows nothing about implementation
const canPlaceOrder = computed(() => validator.isValid(order.value));

async function placeOrder() {
  const result = await placeOrderUseCase(order.value);
  if (result.isSuccess()) {
    router.push(`/orders/${result.getValue().orderId}`);
  } else {
    handleDomainError(result.getError());
  }
}
</script>
```

### 1.3 Service Composition Pattern

Following [^12^] patterns:

```typescript
// src/composables/useOrderService.ts
import { orderRepository } from '@/infrastructure/adapters/postgres/OrderRepository';
import { eventPublisher } from '@/infrastructure/adapters/event-bus/EventPublisher';
import { PlaceOrderUseCase } from '@/application/use-cases/PlaceOrder';

export function useOrderService() {
  // Inject dependencies through ports
  const placeOrder = new PlaceOrderUseCase(orderRepository, eventPublisher);
  
  return {
    placeOrder: (command: PlaceOrderCommand) => placeOrder.execute(command),
    validator: new OrderValidator()
  };
}
```

---

## 2. GraphQL Federation for Bounded Contexts

### 2.1 Schema Design Strategy

Per research [^14^][^15^][^17^], GraphQL Federation aligns perfectly with DDD bounded contexts:

```graphql
# User Management Subgraph (users.yndu.co.ke/graphql)
type User @key(fields: "id") {
  id: ID!
  email: String!
  phone: String!
  profile: UserProfile!
  addresses: [Address!]!
}

type UserProfile {
  firstName: String!
  lastName: String!
  preferredLanguage: String! # sw | en
}

type Address {
  id: ID!
  label: String! # "Home", "Office"
  coordinates: GeoCoordinates!
  zone: DeliveryZone!
}

type GeoCoordinates {
  latitude: Float!
  longitude: Float!
}

enum DeliveryZone {
  KIBWEZI_CENTRAL
  KIBWEZI_NORTH
  NAIROBI_EAST
  NAIROBI_WEST
}

extend type Query {
  me: User!
  user(id: ID!): User
}
```

```graphql
# Inventory Subgraph (inventory.yndu.co.ke/graphql)
type ProduceItem @key(fields: "id") {
  id: ID!
  name: String!
  nameSw: String! # Swahili name
  category: ProduceCategory!
  unitPrice: Money!
  availableQuantity: Quantity!
  seasonality: Seasonality!
  imageUrl: String
}

type BoxTemplate @key(fields: "id") {
  id: ID!
  name: String!
  description: String!
  size: BoxSize!
  basePrice: Money!
  maxWeight: Weight!
  items: [BoxItem!]!
  isCustomizable: Boolean!
}

type BoxItem {
  produceItem: ProduceItem!
  defaultQuantity: Quantity!
  maxQuantity: Quantity!
}

type Money {
  amount: Float!
  currency: Currency! # KES
}

type Quantity {
  value: Float!
  unit: Unit! # kg | pcs | bunches
}

enum BoxSize {
  SMALL
  MEDIUM
  LARGE
}

enum ProduceCategory {
  LEAFY_GREENS
  ROOT_VEGETABLES
  FRUITS
  HERBS
}
```

```graphql
# Ordering Subgraph (orders.yndu.co.ke/graphql)
type Order @key(fields: "id") {
  id: ID!
  user: User! @external
  items: [OrderItem!]!
  totalPrice: Money!
  deliverySlot: DeliverySlot!
  status: OrderStatus!
  placedAt: DateTime!
  confirmedAt: DateTime
}

type OrderItem {
  id: ID!
  boxTemplate: BoxTemplate! @external
  customSelections: [CustomSelection!]
  finalPrice: Money!
}

type CustomSelection {
  produceItem: ProduceItem! @external
  quantity: Quantity!
  linePrice: Money!
}

type DeliverySlot {
  date: Date!
  slotType: SlotType! # SAME_DAY | NEXT_DAY
  cutoffTime: DateTime!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  ASSIGNED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum SlotType {
  SAME_DAY
  NEXT_DAY
}

extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]!
}
```

### 2.2 Federation Gateway Configuration

```typescript
// gateway/src/index.ts
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://users-service:4001/graphql' },
      { name: 'inventory', url: 'http://inventory-service:4002/graphql' },
      { name: 'orders', url: 'http://orders-service:4003/graphql' },
      { name: 'subscriptions', url: 'http://subscription-service:4004/graphql' },
      { name: 'delivery', url: 'http://delivery-service:4005/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });
```

### 2.3 Type-Safe GraphQL with Code Generator

Per research [^35^][^37^][^38^]:

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://gateway:4000/graphql',
  documents: ['src/**/*.vue', 'src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'gql-tag-operations-preset',
      plugins: [],
      config: {
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Money: 'Money', // Branded type
          Quantity: 'Quantity',
        },
        useTypeImports: true,
      },
    },
  },
};

export default config;
```

---

## 3. PostgreSQL Schema Design for DDD

### 3.1 Aggregate Storage Strategy

Per research [^6^][^11^][^21^][^27^], PostgreSQL with JSONB is ideal for DDD aggregates:

```sql
-- Events table for event sourcing (all bounded contexts)
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL,           -- Aggregate ID
    stream_type VARCHAR(64) NOT NULL,  -- "Order", "Subscription", etc.
    version INTEGER NOT NULL,
    event_type VARCHAR(128) NOT NULL,  -- "OrderPlaced", "StockDecremented"
    payload JSONB NOT NULL,
    metadata JSONB,                    -- correlation_id, causation_id
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(stream_id, version)
);

CREATE INDEX idx_events_stream ON domain_events(stream_id, version);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_occurred ON domain_events(occurred_at);

-- Optimistic locking for aggregate updates
CREATE TABLE aggregate_snapshots (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    state JSONB NOT NULL,              -- Serialized aggregate state
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_type ON aggregate_snapshots(type);
```

### 3.2 Bounded Context Specific Tables

```sql
-- User Management Context
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    coordinates POINT NOT NULL,
    zone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_addresses_zone ON user_addresses(zone);

-- Inventory Context
CREATE TABLE produce_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_sw VARCHAR(255),              -- Swahili name
    category VARCHAR(50) NOT NULL,
    unit_price_cents INTEGER NOT NULL, -- Store as integer (KES cents)
    available_quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,         -- kg, pcs, bunches
    reorder_threshold DECIMAL(10,2),
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE box_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(20) NOT NULL CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    base_price_cents INTEGER NOT NULL,
    max_weight_kg DECIMAL(5,2) NOT NULL,
    is_customizable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    items JSONB NOT NULL DEFAULT '[]', -- [{produceId, defaultQty, maxQty}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordering Context
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_price_cents INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('SAME_DAY', 'NEXT_DAY')),
    delivery_address_id UUID NOT NULL,
    items JSONB NOT NULL,              -- Denormalized for queries
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery ON orders(delivery_date);

-- Subscription Context
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    box_template_id UUID NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    next_delivery_date DATE NOT NULL,
    delivery_address_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next ON subscriptions(next_delivery_date) WHERE status = 'ACTIVE';

-- Delivery Context
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_location POINT,
    last_location_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_proof JSONB,              -- Photo, signature, notes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_rider ON delivery_assignments(rider_id);
CREATE INDEX idx_assignments_status ON delivery_assignments(status);
```

### 3.3 JSONB Aggregate Storage Pattern

Per [^6^][^21^], storing aggregates as JSONB:

```typescript
// src/infrastructure/adapters/postgres/OrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: Knex) {}

  async save(order: Order): Promise<void> {
    const events = order.getUncommittedEvents();
    const snapshot = order.toSnapshot(); // Serialize aggregate state

    await this.db.transaction(async (trx) => {
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

      // 2. Update snapshot (optional, for performance)
      await trx('aggregate_snapshots')
        .insert({
          id: order.id,
          type: 'Order',
          version: order.version,
          state: JSON.stringify(snapshot),
        })
        .onConflict('id')
        .merge();

      // 3. Update read model (CQRS)
      await trx('orders')
        .insert(this.toReadModel(order))
        .onConflict('id')
        .merge();
    });

    order.markEventsCommitted();
  }

  async findById(id: OrderId): Promise<Order | null> {
    // Option 1: Rehydrate from events (event sourcing)
    const events = await this.db('domain_events')
      .where({ stream_id: id, stream_type: 'Order' })
      .orderBy('version');

    if (events.length === 0) return null;

    return Order.rehydrate(events.map(e => this.deserializeEvent(e)));

    // Option 2: Use snapshot for performance
    // const snapshot = await this.db('aggregate_snapshots').where({ id }).first();
    // return Order.fromSnapshot(snapshot.state);
  }
}
```

---

## 4. Domain Events & Event-Driven Architecture

### 4.1 Event Structure

Per research [^3^][^4^][^9^][^10^]:

```typescript
// src/domain/events/DomainEvent.ts
export abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly correlationId: string;
  readonly causationId: string;

  constructor(
    readonly aggregateId: string,
    readonly version: number,
    metadata?: { correlationId?: string; causationId?: string }
  ) {
    this.occurredAt = new Date();
    this.correlationId = metadata?.correlationId ?? crypto.randomUUID();
    this.causationId = metadata?.causationId ?? this.correlationId;
  }
}

// src/domain/events/OrderEvents.ts
export class OrderPlaced extends DomainEvent {
  constructor(
    aggregateId: string,
    version: number,
    readonly userId: string,
    readonly items: OrderItemData[],
    readonly totalPrice: Money,
    readonly deliverySlot: DeliverySlot,
    metadata?: EventMetadata
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
    metadata?: EventMetadata
  ) {
    super(aggregateId, version, metadata);
  }
}

export class StockDecremented extends DomainEvent {
  constructor(
    aggregateId: string, // ProduceItem ID
    version: number,
    readonly quantity: Quantity,
    readonly reason: string,
    metadata?: EventMetadata
  ) {
    super(aggregateId, version, metadata);
  }
}
```

### 4.2 In-Memory Event Bus (Development/Single-Node)

```typescript
// src/infrastructure/adapters/event-bus/InMemoryEventBus.ts
export class InMemoryEventBus implements IEventPublisher {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.constructor.name) ?? [];
    
    // Execute handlers in parallel
    await Promise.all(
      handlers.map(handler => 
        handler(event).catch(err => {
          console.error(`Event handler failed for ${event.constructor.name}:`, err);
          // Log to dead letter queue
        })
      )
    );
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(e => this.publish(e)));
  }
}
```

### 4.3 Cross-Bounded Context Event Handlers

```typescript
// src/inventory/application/handlers/OrderPlacedHandler.ts
export class DecrementStockOnOrderPlaced implements EventHandler<OrderPlaced> {
  constructor(
    private inventoryRepository: IInventoryRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async handle(event: OrderPlaced): Promise<void> {
    for (const item of event.items) {
      const produceItem = await this.inventoryRepository.findById(item.produceId);
      
      if (!produceItem) {
        throw new Error(`Produce item ${item.produceId} not found`);
      }

      produceItem.decrementStock(item.quantity, `Order ${event.aggregateId}`);
      
      await this.inventoryRepository.save(produceItem);
      
      // Events are published automatically by repository
    }
  }
}

// src/delivery/application/handlers/OrderConfirmedHandler.ts
export class CreateDeliveryAssignmentOnOrderConfirmed 
  implements EventHandler<OrderConfirmed> {
  
  constructor(
    private riderRepository: IRiderRepository,
    private assignmentRepository: IAssignmentRepository,
    private orderRepository: IOrderRepository
  ) {}

  async handle(event: OrderConfirmed): Promise<void> {
    const order = await this.orderRepository.findById(event.aggregateId);
    if (!order) return;

    const address = order.deliveryAddress;
    const availableRiders = await this.riderRepository.findAvailableInZone(address.zone);
    
    if (availableRiders.length === 0) {
      // Publish event for admin notification
      await this.eventPublisher.publish(new NoRidersAvailable(event.aggregateId));
      return;
    }

    // Assign closest rider (simplified - could use actual distance calculation)
    const rider = availableRiders[0];
    
    const assignment = DeliveryAssignment.create({
      orderId: event.aggregateId,
      riderId: rider.id,
      pickupLocation: 'Kibwezi Farm Hub', // Could be configurable
      deliveryLocation: address.coordinates,
    });

    await this.assignmentRepository.save(assignment);
  }
}
```

---

## 5. TypeScript Value Objects & Branded Types

### 5.1 Branded Types for Type Safety

Per research [^30^][^34^][^40^]:

```typescript
// src/domain/value-objects/branded.ts
type Brand<K, T> = K & { __brand: T };

// Identity types - prevent mixing different ID types
export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type ProduceItemId = Brand<string, 'ProduceItemId'>;
export type RiderId = Brand<string, 'RiderId'>;

// Monetary types - prevent currency errors
export type KES = Brand<number, 'KES'>; // Amount in cents
export type USD = Brand<number, 'USD'>;

// Unit types - prevent unit conversion errors
export type Kilograms = Brand<number, 'Kilograms'>;
export type Grams = Brand<number, 'Grams'>;
export type Pieces = Brand<number, 'Pieces'>;

// Factory functions with validation
export function UserId(id: string): UserId {
  if (!isValidUUID(id)) throw new Error(`Invalid UserId: ${id}`);
  return id as UserId;
}

export function KES(cents: number): KES {
  if (!Number.isInteger(cents)) throw new Error('KES must be in cents (integer)');
  if (cents < 0) throw new Error('KES cannot be negative');
  return cents as KES;
}

export function Kilograms(value: number): Kilograms {
  if (value < 0) throw new Error('Weight cannot be negative');
  return value as Kilograms;
}
```

### 5.2 Value Object Classes

```typescript
// src/domain/value-objects/Money.ts
export class Money {
  private constructor(
    readonly amount: KES,
    readonly currency: 'KES' = 'KES'
  ) {}

  static fromCents(cents: number): Money {
    return new Money(KES(cents));
  }

  static fromShillings(shillings: number): Money {
    return new Money(KES(shillings * 100));
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(KES(this.amount + other.amount), this.currency);
  }

  multiply(factor: number): Money {
    return new Money(KES(Math.round(this.amount * factor)), this.currency);
  }

  toShillings(): number {
    return this.amount / 100;
  }

  toDisplay(): string {
    return `KES ${this.toShillings().toFixed(2)}`;
  }
}

// src/domain/value-objects/DeliverySlot.ts
export class DeliverySlot {
  private constructor(
    readonly date: Date,
    readonly type: 'SAME_DAY' | 'NEXT_DAY'
  ) {}

  static create(preferredDate: Date, currentTime: Date = new Date()): DeliverySlot {
    const cutoffTime = new Date(currentTime);
    cutoffTime.setHours(10, 0, 0, 0); // 10 AM EAT cutoff

    const isSameDayAvailable = 
      preferredDate.toDateString() === currentTime.toDateString() &&
      currentTime < cutoffTime;

    return new DeliverySlot(
      preferredDate,
      isSameDayAvailable ? 'SAME_DAY' : 'NEXT_DAY'
    );
  }

  static forDate(date: Date, type: 'SAME_DAY' | 'NEXT_DAY'): DeliverySlot {
    return new DeliverySlot(date, type);
  }

  get cutoffTime(): Date {
    const cutoff = new Date(this.date);
    cutoff.setHours(10, 0, 0, 0);
    return cutoff;
  }
}
```

---

## 6. CQRS Pattern Implementation

### 6.1 Command Side

Per research [^13^][^16^][^20^]:

```typescript
// src/application/commands/PlaceOrderCommand.ts
export interface PlaceOrderCommand {
  userId: UserId;
  items: OrderItemCommand[];
  deliveryAddressId: string;
  preferredDeliveryDate: Date;
  isSubscription: boolean;
  subscriptionFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

// src/application/handlers/PlaceOrderHandler.ts
export class PlaceOrderHandler implements CommandHandler<PlaceOrderCommand> {
  constructor(
    private orderRepository: IOrderRepository,
    private inventoryRepository: IInventoryRepository,
    private userRepository: IUserRepository,
    private pricer: IBoxPricer,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(command: PlaceOrderCommand): Promise<Result<Order, PlaceOrderError>> {
    // 1. Validate user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      return Result.fail(new UserNotFoundError(command.userId));
    }

    // 2. Validate address
    const address = user.getAddress(command.deliveryAddressId);
    if (!address) {
      return Result.fail(new AddressNotFoundError(command.deliveryAddressId));
    }

    // 3. Check inventory and build order items
    const orderItems: OrderItem[] = [];
    for (const item of command.items) {
      const produceItem = await this.inventoryRepository.findById(item.produceId);
      if (!produceItem) {
        return Result.fail(new ProduceItemNotFoundError(item.produceId));
      }
      if (!produceItem.hasSufficientStock(item.quantity)) {
        return Result.fail(new InsufficientStockError(item.produceId, item.quantity));
      }
      orderItems.push(new OrderItem(produceItem, item.quantity));
    }

    // 4. Calculate pricing
    const pricing = this.pricer.calculate(orderItems);

    // 5. Determine delivery slot
    const deliverySlot = DeliverySlot.create(command.preferredDeliveryDate);

    // 6. Create order aggregate
    const order = Order.create({
      userId: command.userId,
      items: orderItems,
      totalPrice: pricing.total,
      deliverySlot,
      deliveryAddress: address,
    });

    // 7. Persist
    await this.orderRepository.save(order);

    // 8. Publish events (triggered by repository or explicitly)
    await this.eventPublisher.publishAll(order.getUncommittedEvents());

    return Result.ok(order);
  }
}
```

### 6.2 Query Side (Read Models)

```typescript
// src/application/queries/GetUserOrdersQuery.ts
export interface GetUserOrdersQuery {
  userId: UserId;
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  limit: number;
  offset: number;
}

export interface UserOrderDto {
  id: string;
  status: OrderStatus;
  totalPrice: string; // Formatted: "KES 1,250.00"
  itemCount: number;
  deliveryDate: string;
  slotType: 'SAME_DAY' | 'NEXT_DAY';
  canCancel: boolean;
  canReorder: boolean;
}

// src/application/queries/handlers/GetUserOrdersHandler.ts
export class GetUserOrdersHandler implements QueryHandler<GetUserOrdersQuery, UserOrderDto[]> {
  constructor(private db: Knex) {}

  async execute(query: GetUserOrdersQuery): Promise<UserOrderDto[]> {
    // Direct DB query - optimized for reads, no domain logic
    let dbQuery = this.db('orders')
      .where('user_id', query.userId)
      .orderBy('placed_at', 'desc')
      .limit(query.limit)
      .offset(query.offset);

    if (query.status) {
      dbQuery = dbQuery.where('status', query.status);
    }

    if (query.fromDate) {
      dbQuery = dbQuery.where('delivery_date', '>=', query.fromDate);
    }

    if (query.toDate) {
      dbQuery = dbQuery.where('delivery_date', '<=', query.toDate);
    }

    const rows = await dbQuery;

    return rows.map(row => ({
      id: row.id,
      status: row.status,
      totalPrice: formatKES(row.total_price_cents),
      itemCount: row.items.length,
      deliveryDate: formatDate(row.delivery_date),
      slotType: row.slot_type,
      canCancel: ['PENDING', 'CONFIRMED'].includes(row.status),
      canReorder: row.status === 'DELIVERED',
    }));
  }
}
```

### 6.3 Result Monad for Error Handling

```typescript
// src/shared/Result.ts
export class Result<T, E> {
  private constructor(
    private readonly isSuccess: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }

  getValue(): T {
    if (!this.isSuccess) throw new Error('Cannot get value from failed result');
    return this.value!;
  }

  getError(): E {
    if (this.isSuccess) throw new Error('Cannot get error from successful result');
    return this.error!;
  }

  isSuccess(): boolean {
    return this.isSuccess;
  }

  isFailure(): boolean {
    return !this.isSuccess;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess ? Result.ok(fn(this.value!)) : Result.fail(this.error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess ? fn(this.value!) : Result.fail(this.error!);
  }
}

// Domain errors
export abstract class DomainError {
  constructor(
    readonly message: string,
    readonly code: string
  ) {}
}

export class InsufficientStockError extends DomainError {
  constructor(
    readonly produceId: ProduceItemId,
    readonly requested: Quantity,
    readonly available: Quantity
  ) {
    super(
      `Insufficient stock for ${produceId}. Requested: ${requested}, Available: ${available}`,
      'INVENTORY.INSUFFICIENT_STOCK'
    );
  }
}

export class CutoffMissedError extends DomainError {
  constructor(
    readonly cutoffTime: Date,
    readonly actualTime: Date
  ) {
    super(
      `Same-day cutoff missed. Orders must be placed before ${cutoffTime.toISOString()}`,
      'ORDER.CUTOFF_MISSED'
    );
  }
}
```

---

## 7. AI-Agent First Code Organization

### 7.1 Modular Agent-Ready Structure

Per research [^2^]:

```
src/
├── domain/                    # Pure business logic - AI can reason about this
│   ├── aggregates/           # Self-contained business entities
│   │   ├── Order/
│   │   │   ├── Order.ts      # Aggregate root
│   │   │   ├── OrderItem.ts
│   │   │   ├── events/       # Domain events
│   │   │   └── invariants.ts # Business rules as pure functions
│   │   ├── ProduceItem/
│   │   ├── Subscription/
│   │   └── Rider/
│   ├── value-objects/        # Small, composable types
│   │   ├── Money.ts
│   │   ├── Quantity.ts
│   │   └── DeliverySlot.ts
│   └── services/             # Domain services
│       ├── BoxPricer.ts      # Pure pricing logic
│       └── OrderValidator.ts
│
├── application/              # Use cases - orchestration layer
│   ├── commands/            # Write operations
│   ├── queries/             # Read operations
│   ├── handlers/            # Command/query handlers
│   └── ports/               # Interfaces for external world
│       ├── inbound/         # Driving ports (services)
│       └── outbound/        # Driven ports (repositories)
│
├── infrastructure/          # Technical details
│   ├── adapters/
│   │   ├── postgres/        # Database adapters
│   │   ├── graphql/         # GraphQL resolvers
│   │   ├── event-bus/       # Event publishing
│   │   └── sms/             # SMS gateway
│   └── config/              # Environment, DI container
│
└── presentation/            # Vue 3 frontend
    ├── composables/         # Reusable composition functions
    ├── stores/              # Pinia stores (thin layer)
    ├── views/               # Page components
    └── components/          # Reusable UI components
```

### 7.2 Pure Functions for AI Reasoning

```typescript
// src/domain/aggregates/Order/invariants.ts
// Pure functions - easy for AI to understand and test

export function canAddItem(
  currentItems: OrderItem[],
  newItem: OrderItem,
  maxWeight: Kilograms
): boolean {
  const currentWeight = calculateTotalWeight(currentItems);
  const newWeight = currentWeight + newItem.weight;
  return newWeight <= maxWeight;
}

export function calculateOrderTotal(items: OrderItem[]): Money {
  return items.reduce(
    (total, item) => total.add(item.linePrice),
    Money.fromCents(0)
  );
}

export function determineDeliverySlot(
  orderTime: Date,
  preferredDate: Date,
  inventoryAvailable: boolean,
  cutoffHour: number = 10
): DeliverySlot {
  const cutoff = new Date(orderTime);
  cutoff.setHours(cutoffHour, 0, 0, 0);

  const isSameDay = 
    orderTime < cutoff &&
    isToday(preferredDate) &&
    inventoryAvailable;

  return DeliverySlot.forDate(
    preferredDate,
    isSameDay ? 'SAME_DAY' : 'NEXT_DAY'
  );
}

// Declarative business rules
export const ORDER_RULES = {
  SMALL_BOX: {
    maxWeight: Kilograms(5),
    basePrice: Money.fromShillings(500),
    maxItems: 8,
  },
  MEDIUM_BOX: {
    maxWeight: Kilograms(10),
    basePrice: Money.fromShillings(900),
    maxItems: 15,
  },
  LARGE_BOX: {
    maxWeight: Kilograms(20),
    basePrice: Money.fromShillings(1500),
    maxItems: 25,
  },
  SAME_DAY_CUTOFF: 10, // 10 AM EAT
} as const;
```

### 7.3 Event-Driven Agent Integration Points

```typescript
// Future AI agent integration points

// src/domain/ports/AIAgentPort.ts
export interface IRecommendationEngine {
  // AI-driven custom box recommendations
  suggestBoxContents(
    userId: UserId,
    preferences: UserPreferences,
    budget: Money
  ): Promise<RecommendedBox[]>;

  // Predictive inventory ordering
  predictDemand(
    produceId: ProduceItemId,
    horizon: number // days
  ): Promise<DemandForecast>;
}

export interface IChatInterface {
  // Natural language order placement
  processOrderIntent(
    message: string,
    userId: UserId
  ): Promise<OrderIntentResult>;
}

// Event handlers for AI triggers
export class AITriggeredEventHandlers {
  // Trigger demand prediction when stock is low
  async onLowStock(event: StockLowEvent): Promise<void> {
    const forecast = await this.aiEngine.predictDemand(
      event.produceId,
      7 // 7 days
    );
    
    await this.adminNotificationService.notify({
      type: 'AI_DEMAND_FORECAST',
      produceId: event.produceId,
      recommendedOrderQuantity: forecast.recommendedOrder,
      confidence: forecast.confidence,
    });
  }

  // Personalized recommendations after order
  async onOrderDelivered(event: OrderDeliveredEvent): Promise<void> {
    const recommendations = await this.aiEngine.suggestBoxContents(
      event.userId,
      await this.getUserPreferences(event.userId),
      Money.fromShillings(1000)
    );

    await this.notificationService.sendPush(event.userId, {
      title: 'Your next box idea?',
      body: `Based on your last order, try ${recommendations[0].name}!`,
    });
  }
}
```

---

## 8. Pinia Store Patterns for Domain State

### 8.1 Thin Store Layer

Per research [^31^][^36^][^42^]:

```typescript
// src/presentation/stores/orderStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOrderService } from '@/composables/useOrderService';
import type { Order } from '@/domain/aggregates/Order/Order';

export const useOrderStore = defineStore('orders', () => {
  // State
  const currentOrder = ref<Order | null>(null);
  const userOrders = ref<Order[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters (computed)
  const canPlaceOrder = computed(() => {
    return currentOrder.value?.isValid() ?? false;
  });

  const orderTotal = computed(() => {
    return currentOrder.value?.totalPrice.toDisplay() ?? 'KES 0.00';
  });

  // Actions - delegate to domain services
  const { placeOrder: placeOrderUseCase } = useOrderService();

  async function placeOrder(command: PlaceOrderCommand) {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await placeOrderUseCase.execute(command);
      
      if (result.isSuccess()) {
        currentOrder.value = result.getValue();
        return result.getValue();
      } else {
        error.value = result.getError().message;
        throw result.getError();
      }
    } finally {
      isLoading.value = false;
    }
  }

  function clearCurrentOrder() {
    currentOrder.value = null;
  }

  return {
    currentOrder,
    userOrders,
    isLoading,
    error,
    canPlaceOrder,
    orderTotal,
    placeOrder,
    clearCurrentOrder,
  };
});
```

### 8.2 Composable Pattern for Domain Logic

```typescript
// src/presentation/composables/useBoxBuilder.ts
import { ref, computed } from 'vue';
import { useInventoryStore } from '@/stores/inventoryStore';
import { BoxSize, ORDER_RULES } from '@/domain/constants';
import { Money } from '@/domain/value-objects/Money';

export function useBoxBuilder(size: BoxSize) {
  const inventory = useInventoryStore();
  const selections = ref<Map<string, number>>(new Map());

  const rules = computed(() => ORDER_RULES[size]);

  const currentWeight = computed(() => {
    let total = 0;
    for (const [itemId, qty] of selections.value) {
      const item = inventory.getItem(itemId);
      if (item) total += item.weightPerUnit * qty;
    }
    return total;
  });

  const remainingWeight = computed(() => {
    return rules.value.maxWeight - currentWeight.value;
  });

  const currentPrice = computed(() => {
    let total = rules.value.basePrice;
    for (const [itemId, qty] of selections.value) {
      const item = inventory.getItem(itemId);
      if (item) total = total.add(item.unitPrice.multiply(qty));
    }
    return total;
  });

  const canAddItem = (itemId: string, quantity: number): boolean => {
    const item = inventory.getItem(itemId);
    if (!item) return false;
    
    const newWeight = currentWeight.value + (item.weightPerUnit * quantity);
    return newWeight <= rules.value.maxWeight;
  };

  const addItem = (itemId: string, quantity: number): Result<void, string> => {
    if (!canAddItem(itemId, quantity)) {
      return Result.fail('Would exceed box weight limit');
    }
    
    const current = selections.value.get(itemId) ?? 0;
    selections.value.set(itemId, current + quantity);
    return Result.ok(undefined);
  };

  const removeItem = (itemId: string) => {
    selections.value.delete(itemId);
  };

  const build = () => ({
    size,
    selections: Array.from(selections.value.entries()).map(([id, qty]) => ({
      produceId: id,
      quantity: qty,
    })),
    totalWeight: currentWeight.value,
    totalPrice: currentPrice.value,
  });

  return {
    selections,
    currentWeight,
    remainingWeight,
    currentPrice,
    canAddItem,
    addItem,
    removeItem,
    build,
  };
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Domain Layer)

```typescript
// src/domain/aggregates/Order/Order.spec.ts
import { describe, it, expect } from 'vitest';
import { Order } from './Order';
import { Money } from '@/domain/value-objects/Money';
import { DeliverySlot } from '@/domain/value-objects/DeliverySlot';

describe('Order Aggregate', () => {
  it('should calculate total price correctly', () => {
    const order = Order.create({
      userId: UserId('user-1'),
      items: [
        new OrderItem(ProduceItemId('tomato'), Quantity(2), Money.fromShillings(50)),
        new OrderItem(ProduceItemId('onion'), Quantity(1), Money.fromShillings(30)),
      ],
      deliverySlot: DeliverySlot.forDate(new Date(), 'NEXT_DAY'),
    });

    expect(order.totalPrice.toShillings()).toBe(130);
  });

  it('should reject orders placed after cutoff for same-day', () => {
    const afterCutoff = new Date('2024-01-15T11:00:00'); // 11 AM
    
    const result = Order.create({
      userId: UserId('user-1'),
      items: [/* ... */],
      deliverySlot: DeliverySlot.create(new Date('2024-01-15'), afterCutoff),
    });

    expect(result.slotType).toBe('NEXT_DAY');
  });

  it('should emit OrderPlaced event on creation', () => {
    const order = Order.create({ /* ... */ });

    const events = order.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(OrderPlaced);
  });
});
```

### 9.2 Integration Tests (Adapters)

```typescript
// src/infrastructure/adapters/postgres/OrderRepository.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgresOrderRepository } from './OrderRepository';
import { knex } from 'knex';

describe('PostgresOrderRepository', () => {
  let container: PostgreSqlContainer;
  let db: Knex;
  let repository: PostgresOrderRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    db = knex({
      client: 'pg',
      connection: container.getConnectionUri(),
    });
    await runMigrations(db);
    repository = new PostgresOrderRepository(db);
  });

  afterAll(async () => {
    await db.destroy();
    await container.stop();
  });

  it('should persist and retrieve order with events', async () => {
    const order = Order.create({ /* ... */ });
    
    await repository.save(order);
    
    const retrieved = await repository.findById(order.id);
    expect(retrieved?.totalPrice.toShillings()).toBe(order.totalPrice.toShillings());
    expect(retrieved?.version).toBe(1);
  });
});
```

### 9.3 E2E Tests (GraphQL)

```typescript
// tests/e2e/order-flow.spec.ts
import { describe, it, expect } from 'vitest';
import { gql } from 'graphql-tag';
import { createTestClient } from './helpers';

describe('Order Placement Flow', () => {
  it('should place order and trigger delivery assignment', async () => {
    const client = await createTestClient();

    // 1. Place order via GraphQL
    const { data } = await client.mutate({
      mutation: gql`
        mutation PlaceOrder($input: PlaceOrderInput!) {
          placeOrder(input: $input) {
            id
            status
            totalPrice
            deliverySlot {
              date
              type
            }
          }
        }
      `,
      variables: {
        input: {
          items: [{ produceId: 'tomato-1', quantity: 2 }],
          deliveryAddressId: 'addr-1',
          preferredDeliveryDate: '2024-01-20',
        },
      },
    });

    expect(data.placeOrder.status).toBe('PENDING');

    // 2. Admin confirms order
    await client.mutate({
      mutation: CONFIRM_ORDER_MUTATION,
      variables: { orderId: data.placeOrder.id },
    });

    // 3. Verify delivery assignment created
    const assignment = await client.query({
      query: GET_DELIVERY_ASSIGNMENT,
      variables: { orderId: data.placeOrder.id },
    });

    expect(assignment.data.deliveryAssignment.status).toBe('PENDING');
  });
});
```

---

## 10. Deployment & Scaling Considerations

### 10.1 Service Boundaries

```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  # GraphQL Gateway
  gateway:
    build: ./gateway
    ports:
      - "4000:4000"
    environment:
      - USER_SERVICE_URL=http://users:4001
      - INVENTORY_SERVICE_URL=http://inventory:4002
      - ORDER_SERVICE_URL=http://orders:4003

  # Bounded Context: User Management
  users:
    build: ./services/users
    environment:
      - DATABASE_URL=postgres://postgres:pass@postgres:5432/users
    depends_on:
      - postgres
      - redis

  # Bounded Context: Inventory
  inventory:
    build: ./services/inventory
    environment:
      - DATABASE_URL=postgres://postgres:pass@postgres:5432/inventory
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Bounded Context: Ordering
  orders:
    build: ./services/orders
    environment:
      - DATABASE_URL=postgres://postgres:pass@postgres:5432/orders
      - EVENT_BUS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Shared Infrastructure
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 10.2 Scaling Strategy

| Component | Scaling Approach | Notes |
|-----------|-----------------|-------|
| GraphQL Gateway | Horizontal | Stateless, route by query complexity |
| User Service | Horizontal + Cache | Redis for sessions |
| Inventory Service | Horizontal + Read Replicas | Heavy read load for browsing |
| Order Service | Horizontal + Partitioning | Shard by date or user region |
| Event Bus | Redis Streams / Kafka | Guaranteed delivery |
| PostgreSQL | Primary-Replica + Connection Pooling | PgBouncer for connection management |

---

## 11. Key Recommendations Summary

### 11.1 Architecture Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Aggregate Storage** | PostgreSQL JSONB with Event Sourcing | ACID compliance, audit trail, flexible schema |
| **API Layer** | GraphQL Federation | Natural bounded context boundaries, type safety |
| **Frontend State** | Pinia + Domain Services | Thin UI layer, business logic in domain |
| **Cross-Context Comm** | Domain Events via Redis | Loose coupling, eventual consistency |
| **Type Safety** | Branded Types + strict TypeScript | Compile-time guarantees, prevent ID mixing |
| **Error Handling** | Result Monad | Explicit error paths, no exceptions for domain |
| **AI Integration** | Event-driven ports | Clean extension points for ML/recommendations |

### 11.2 Implementation Phases

**Phase 1: Core Domain**
1. Value objects (Money, Quantity, DeliverySlot)
2. Order aggregate with invariants
3. PostgreSQL JSONB event store
4. In-memory event bus

**Phase 2: Infrastructure**
1. GraphQL subgraphs per bounded context
2. Federation gateway
3. Repository adapters
4. Vue 3 + Pinia frontend

**Phase 3: Integration**
1. SMS adapter (Twilio/Africa's Talking)
2. Rider assignment algorithm
3. Subscription scheduler
4. Admin dashboard

**Phase 4: Intelligence**
1. Demand forecasting port
2. Recommendation engine
3. Chat-based ordering interface

---

## References

- [^5^] What Domain-Driven Design Looks Like in TypeScript - williamjohnson.com
- [^6^] The Ideal Domain-Driven Design Aggregate Store? - Kalele
- [^7^] Implementing Hexagonal Architecture with DDD in TypeScript - LinkedIn
- [^12^] Hexagonal Architecture Frontend - GitHub (juanm4)
- [^14^] Schema Stitching vs GraphQL Federation - Hygraph
- [^15^] Advanced GraphQL Federation Techniques - dev.to
- [^21^] Is Event Sourcing hard? Part 2 - wkrzywiec
- [^30^] Make Illegal States Unrepresentable! - Khalil Stemmler
- [^34^] Writing Robust TypeScript with Branded Primitives - Medium
- [^35^] Type-Safe GraphQL Queries in Vue 3 - alexop.dev
