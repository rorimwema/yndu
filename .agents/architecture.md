# Yndu System Architecture

## Overview

Production-ready Domain-Driven Design (DDD) architecture for Yndu fresh produce delivery system.
Built with Vue 3/TypeScript frontend, Deno/Oak API layer, GraphQL federation, and PostgreSQL
persistence.

---

## Architecture Pattern: Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DRIVING ADAPTERS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Vue 3 UI   │  │  GraphQL    │  │  Admin Dashboard        │  │
│  │  (Mobile)   │  │  Gateway    │  │  (Vue/Web)              │  │
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
│  │  (JSONB Store)  │  │  (Redis)    │  │   (Africa's Talking)│  │
│  └─────────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer          | Technology             | Purpose                             |
| -------------- | ---------------------- | ----------------------------------- |
| **Frontend**   | Vue 3 + TypeScript     | Reactive UI with Composition API    |
| **Animations** | Motion Vue (motion-v)  | Hardware-accelerated animations     |
| **State**      | Pinia                  | Type-safe state management          |
| **Styling**    | Tailwind CSS + Flexoki | Utility-first CSS with custom theme |
| **Runtime**    | Deno 1.41+             | Secure TypeScript runtime           |
| **Framework**  | Oak                    | Web framework (Express alternative) |
| **Validation** | Zod                    | Schema validation                   |
| **Database**   | PostgreSQL 17          | ACID-compliant data storage         |
| **Cache**      | Redis 7                | Event bus and session cache         |
| **API**        | GraphQL Federation     | Distributed schema composition      |
| **Testing**    | Deno Test              | Built-in test runner                |

---

## Implementation Status Audit (2026-02-21)

### Implemented

- Enterprise DB migration exists and is wired in bootstrap (`004_enterprise_schema.sql`) with:
  - RBAC roles on `users`
  - `b2b_company_profiles`, `rider_profiles`
  - `suppliers`, `purchase_orders`, traceability fields on `inventory_movements`
  - `vehicles`, `delivery_routes`, route stop mapping
  - `invoices` and B2B pricing structures
- Local infrastructure has separate dev/prod compose stacks with Postgres/Redis/backend/frontend and
  production-style Nginx stack.
- Backend now exposes a working `/graphql` endpoint (Oak + GraphQL execution) with:
  - Query/Mutation resolvers for users, inventory, and orders
  - JWT-aware `me` resolution
  - Query depth limiting
  - Introspection disabled in production
- Federation runtime is now executable in local compose:
  - `users`, `inventory`, `orders` subgraph servers are running
  - `gateway` composes subgraphs at `http://localhost:4000/graphql`

### Left Out / Still Incomplete

- Federation domain parity is not fully complete yet:
  - Some subgraph fields currently use adapter logic over existing REST endpoints and may return
    partial data for not-yet-implemented backend capabilities.
- REST parity is incomplete:
  - `src/routes/users/mod.ts` and `src/routes/inventory/mod.ts` are still placeholder responses.
- Domain adapters for new enterprise entities are still missing:
  - No repositories/handlers yet for suppliers, purchase orders, invoices, vehicles, route
    manifests.
- GraphQL contract alignment is partial:
  - Federation SDL in `services/*/schema.graphql` is ahead of currently executable runtime
    resolvers.

### GraphQL Setup Direction

1. Keep both endpoints active: `/graphql` on backend for direct integration and `:4000/graphql` for
   composed federation.
2. Add DataLoader and query cost analysis in subgraphs before production federation rollout.
3. Complete backend handlers for users/inventory so subgraphs can remove temporary adapter
   fallbacks.
4. Add gateway/subgraph services to production compose after parity and auth propagation are
   finalized.

---

## Project Structure

```
yndu/
├── deno.json                          # Deno configuration & tasks
├── docker-compose.yml                 # Service orchestration
├── Dockerfile.deno                    # Production Docker image
├── src/
│   ├── main.ts                        # Deno entry point
│   ├── deps.ts                        # Centralized dependencies
│   │
│   ├── routes/                        # API Routes (Oak)
│   │   ├── mod.ts                     # Route aggregation
│   │   ├── orders/
│   │   ├── inventory/
│   │   └── users/
│   │
│   ├── middleware/                    # Express-style middleware
│   │   ├── error-handler.ts
│   │   └── logger.ts
│   │
│   ├── domain/                        # DDD Domain Layer
│   │   ├── aggregates/
│   │   │   ├── Order/
│   │   │   │   ├── Order.ts
│   │   │   │   ├── OrderItem.ts
│   │   │   │   └── invariants.ts
│   │   │   └── ProduceItem/
│   │   ├── value-objects/
│   │   │   ├── Money.ts
│   │   │   ├── Quantity.ts
│   │   │   └── DeliverySlot.ts
│   │   ├── events/
│   │   │   ├── DomainEvent.ts
│   │   │   └── OrderEvents.ts
│   │   └── ports/
│   │       ├── IOrderRepository.ts
│   │       └── IEventPublisher.ts
│   │
│   ├── application/                   # DDD Application Layer
│   │   ├── commands/
│   │   │   └── PlaceOrderCommand.ts
│   │   ├── handlers/
│   │   │   ├── PlaceOrderHandler.ts
│   │   │   └── GetUserOrdersHandler.ts
│   │   └── queries/
│   │       └── GetUserOrdersQuery.ts
│   │
│   ├── infrastructure/                # DDD Infrastructure Layer
│   │   ├── adapters/
│   │   │   ├── postgres/
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   └── InventoryRepository.ts
│   │   │   └── event-bus/
│   │   │       └── InMemoryEventBus.ts
│   │   └── config/
│   │       ├── database.ts
│   │       ├── redis.ts
│   │       └── env.ts
│   │
│   └── presentation/                  # Vue 3 Frontend
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── router/
│       │   ├── stores/
│       │   ├── components/
│       │   ├── composables/
│       │   └── views/
│       ├── assets/css/
│       │   └── flexoki.css
│       └── index.html
│
├── services/                          # GraphQL Subgraphs
│   ├── users/
│   ├── inventory/
│   └── orders/
│
├── gateway/                           # Apollo Federation Gateway
│   └── src/index.js
│
└── src/infrastructure/adapters/postgres/migrations/
    ├── 001_initial_schema.sql
    ├── 002_enhanced_schema.sql
    └── seeds/001_seed_data.sql
```

---

## Domain Layer

### Aggregates

#### Order Aggregate

```typescript
class Order {
  id: OrderId;
  userId: UserId;
  items: OrderItem[];
  totalPrice: Money;
  deliverySlot: DeliverySlot;
  status: OrderStatus;
  version: number;

  static create(props: OrderProps): Order;
  confirm(confirmedBy: string): void;
  cancel(reason: string, cancelledBy: string): void;
  assignRider(riderId: string): void;
  markDelivered(deliveryProof?: object): void;
}
```

#### ProduceItem Aggregate

```typescript
class ProduceItem {
  id: ProduceItemId;
  name: string;
  nameSw?: string;
  category: ProduceCategory;
  unitPrice: Money;
  availableQuantity: Quantity;
  reorderThreshold: Quantity;
  isSeasonal: boolean;

  hasSufficientStock(requested: Quantity): boolean;
  decrementStock(quantity: Quantity, reason: string): void;
  incrementStock(quantity: Quantity, reason: string): void;
}
```

### Value Objects

```typescript
// Money - stored as integer cents (KES)
class Money {
  amount: number; // cents
  currency: 'KES';

  static fromCents(cents: number): Money;
  static fromShillings(shillings: number): Money;
  add(other: Money): Money;
  multiply(factor: number): Money;
}

// Quantity with unit safety
class Quantity {
  value: number;
  unit: 'kg' | 'g' | 'pcs' | 'bunches';

  toKilograms(): number;
  toGrams(): number;
}

// Delivery slot determination
class DeliverySlot {
  date: Date;
  type: 'SAME_DAY' | 'NEXT_DAY';

  static create(preferredDate: Date, currentTime?: Date): DeliverySlot;
}
```

### Domain Events

```typescript
// Order lifecycle events
class OrderPlaced extends DomainEvent
class OrderConfirmed extends DomainEvent
class OrderCancelled extends DomainEvent
class OrderAssigned extends DomainEvent
class OrderDelivered extends DomainEvent

// Inventory events
class StockDecremented extends DomainEvent
class StockIncremented extends DomainEvent
class StockLow extends DomainEvent
```

---

## Application Layer

### Commands

```typescript
interface PlaceOrderCommand {
  userId: UserId;
  items: OrderItemCommand[];
  deliveryAddressId: AddressId;
  preferredDeliveryDate: Date;
  isSubscription: boolean;
  subscriptionFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

class PlaceOrderHandler {
  async execute(command: PlaceOrderCommand): Promise<Result<Order, DomainError>>;
}
```

### Queries (CQRS)

```typescript
interface GetUserOrdersQuery {
  userId: UserId;
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  limit: number;
  offset: number;
}

class GetUserOrdersHandler {
  async execute(query: GetUserOrdersQuery): Promise<UserOrderDto[]>;
}
```

---

## Infrastructure Layer

### Repository Pattern

```typescript
// Port (Interface)
interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
}

// Adapter (Implementation)
class PostgresOrderRepository implements IOrderRepository {
  constructor(private db: Knex);

  async save(order: Order): Promise<void> {
    // Event sourcing with PostgreSQL JSONB
    // 1. Append events to domain_events table
    // 2. Update aggregate_snapshots
    // 3. Update read model (orders table)
  }

  async findById(id: OrderId): Promise<Order | null> {
    // Rehydrate from events
    const events = await this.db('domain_events')
      .where({ stream_id: id, stream_type: 'Order' })
      .orderBy('version');
    return Order.rehydrate(events);
  }
}
```

### Event Bus

```typescript
interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

class InMemoryEventBus implements IEventPublisher {
  private handlers: Map<string, EventHandler[]>;

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void;

  async publish(event: DomainEvent): Promise<void>;
}
```

---

## Database Schema

### Event Sourcing

```sql
-- Events table for all bounded contexts
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL,
    stream_type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(stream_id, version)
) PARTITION BY RANGE (occurred_at);

-- Aggregate snapshots for performance
CREATE TABLE aggregate_snapshots (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Read Models

```sql
-- Orders (denormalized for queries)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_price_cents INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    slot_type VARCHAR(20) NOT NULL,
    items JSONB NOT NULL,
    placed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produce items
CREATE TABLE produce_items (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    available_quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL
);
```

---

## Frontend Architecture

### Component Hierarchy

```
App.vue
├── AppHeader.vue
│   ├── Logo
│   ├── Navigation
│   ├── Search
│   └── CartBadge
├── RouterView
│   └── LandingPage.vue
│       ├── HeroSection.vue
│       ├── ProductSection.vue
│       │   └── ProductCard.vue (×n)
│       ├── CTASection.vue
│       └── StepCard.vue (×3)
└── AppFooter.vue
    ├── Newsletter
│   ├── Links
│   └── Social
```

### State Management (Pinia)

```typescript
// stores/authStore.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (credentials: LoginCredentials): Promise<boolean>
  const logout = async (): Promise<void>
  const initAuth = () => void
  
  return { user, token, isAuthenticated, login, logout, initAuth }
})

// stores/cartStore.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = computed(() => calculateTotal(items.value))
  
  const addItem = (product: Product, quantity: number) => void
  const removeItem = (productId: string) => void
  const clearCart = () => void
  
  return { items, total, addItem, removeItem, clearCart }
})
```

### Composables

```typescript
// useAuth.ts - Authentication logic
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async (credentials: LoginCredentials, redirectTo?: string) => {
    const success = await authStore.login(credentials);
    if (success && redirectTo) await router.push(redirectTo);
    return success;
  };

  return { login, logout, isAuthenticated, user };
}

// useBoxBuilder.ts - Box customization
export function useBoxBuilder(size: BoxSize, inventory: Map<string, ProduceItem>) {
  const selections = ref<Map<string, number>>(new Map());
  const currentWeight = computed(() => calculateWeight(selections.value));
  const currentPrice = computed(() => calculatePrice(selections.value));
  const canAddItem = (itemId: string, quantity: number) => boolean;

  return { selections, currentWeight, currentPrice, canAddItem };
}
```

---

## Design System

### Flexoki Color Palette

```css
:root {
  /* Base */
  --flexoki-bg: #f6f8f6; /* Light green-gray background */
  --flexoki-paper: #ffffff; /* White cards */
  --flexoki-primary: #13ec13; /* Vibrant green (Yndu brand) */
  --flexoki-warning: #e67e22; /* Earth orange */

  /* Grayscale */
  --flexoki-50: #f0f4f0;
  --flexoki-100: #e2e8e2;
  --flexoki-200: #c6d0c6;
  --flexoki-300: #a8b8a8;
  --flexoki-400: #8aa08a;
  --flexoki-500: #6c886c;
  --flexoki-600: #546a54;
  --flexoki-700: #3c4c3c;
  --flexoki-800: #111811;
  --flexoki-900: #111811;
}
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**:
  - Hero: 4xl-6xl (clamp for responsive)
  - H1: 3xl
  - H2: 2xl
  - Body: base (1rem)
  - Small: sm

### Spacing Scale

| Token   | Value  | Usage            |
| ------- | ------ | ---------------- |
| `gap-2` | 0.5rem | Tight spacing    |
| `gap-4` | 1rem   | Standard spacing |
| `gap-6` | 1.5rem | Comfortable      |
| `gap-8` | 2rem   | Loose            |
| `py-16` | 4rem   | Section padding  |

### Responsive Breakpoints

```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
```

---

## API Design

### REST Endpoints (Deno/Oak)

```typescript
// Health
GET /health

// Orders
GET    /api/orders              // List orders (with filters)
GET    /api/orders/:id          // Get order by ID
POST   /api/orders              // Create order
PUT    /api/orders/:id/status   // Update order status

// Inventory
GET /api/inventory              // List produce items
GET /api/inventory/:id          // Get item by ID

// Users
GET /api/users/me               // Get current user
```

### GraphQL Schema

```graphql
type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  totalPrice: Money!
  deliverySlot: DeliverySlot!
  status: OrderStatus!
  placedAt: DateTime!
}

type Query {
  me: User!
  orders(userId: ID, status: OrderStatus): [Order!]!
  order(id: ID!): Order
  produceItems(category: ProduceCategory): [ProduceItem!]!
}

type Mutation {
  placeOrder(input: PlaceOrderInput!): Order!
  confirmOrder(orderId: ID!): Order!
  cancelOrder(orderId: ID!, reason: String!): Order!
}
```

---

## Deployment

### Docker Compose

```yaml
services:
  frontend:
    build: ./src/presentation
    ports:
      - '3000:3000'

  backend:
    build:
      dockerfile: Dockerfile.deno
    ports:
      - '8000:8000'
    environment:
      - DATABASE_URL=postgres://...
      - REDIS_URL=redis://...

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
```

### Environment Variables

```bash
# Server
PORT=8000
HOST=0.0.0.0

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=...
DATABASE_NAME=yndu

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=...
CORS_ORIGIN=*
```

---

## Testing Strategy

### Unit Tests (Deno)

```typescript
// tests/unit/money_test.ts
Deno.test('Money.fromCents should create money from cents', () => {
  const money = Money.fromCents(5000);
  assertEquals(money.amount, 5000);
  assertEquals(money.currency, 'KES');
});
```

### Integration Tests

```typescript
// Test API endpoints
Deno.test('POST /api/orders should create order', async () => {
  const response = await fetch('http://localhost:8000/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  assertEquals(response.status, 201);
});
```

### E2E Tests

```typescript
// Test complete user flow
Deno.test('Order placement flow', async () => {
  // 1. Login
  // 2. Add items to cart
  // 3. Place order
  // 4. Verify order created
});
```

---

## Skills Used

- **database-schema-design**: PostgreSQL schema with 3NF normalization
- **deno-typescript**: Deno runtime with TypeScript
- **vue**: Vue 3 Composition API patterns
- **nuxt-core**: Nuxt 4 framework fundamentals
- **nuxt-ui**: Nuxt UI component library
- **reka-ui**: Headless accessible components
- **motion**: Motion Vue animations
- **tailwind-patterns**: Tailwind CSS best practices
- **responsive-web-design**: Mobile-first responsive design

---

**Version**: 1.1.0\
**Last Updated**: 2026-02-21\
**Repository**: https://github.com/rorimwema/yndu
