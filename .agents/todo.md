# TODO (Architecture Gaps)

## 🔴 Critical Gaps (Block Production)

### 1. Missing Application → Route Connection (CRITICAL)

**Status:** Routes have TODO comments, not wired to handlers\
**Location:** `src/routes/orders/handlers.ts`, `src/routes/users/mod.ts`,
`src/routes/inventory/mod.ts`

**Current State:**

```typescript
// src/routes/orders/handlers.ts
export async function createOrder(ctx: Context) {
  const body = ctx.state.validatedBody;
  // TODO: Call application service ← NOT CONNECTED!
  ctx.response.status = 201;
  ctx.response.body = { id: crypto.randomUUID(), ... };
}
```

**Required Fix:**

1. Create dependency injection container in `main.ts`
2. Initialize handlers with injected services:
   ```typescript
   const placeOrderHandler = new PlaceOrderHandler(
     orderRepository,
     inventoryRepository,
     userRepository,
     eventPublisher,
   );
   ```
3. Update route handlers to call application layer:
   ```typescript
   export function createOrder(handler: PlaceOrderHandler) {
     return async (ctx: Context) => {
       const result = await handler.execute(ctx.state.command);
       if (result.isFailure()) {
         ctx.response.status = mapErrorToStatus(result.error);
         ctx.response.body = { error: result.error.message };
         return;
       }
       ctx.response.body = result.value;
     };
   }
   ```

**Files to Modify:**

- `src/main.ts` - Add DI container setup
- `src/routes/orders/handlers.ts` - Wire to PlaceOrderHandler, GetUserOrdersHandler
- `src/routes/orders/mod.ts` - Pass handler instances to routes
- `src/routes/users/mod.ts` - Wire to user handlers
- `src/routes/inventory/mod.ts` - Wire to inventory handlers

---

### 2. No Optimistic Locking (Data Integrity Risk)

**Status:** Repository saves without version check\
**Location:** `src/infrastructure/adapters/postgres/OrderRepository.ts`

**Current State:**

```typescript
// No version check before save
await this.orderRepository.save(order); // Could overwrite concurrent changes
```

**Required Fix:**

```typescript
// In PostgresOrderRepository.save()
await trx('aggregate_snapshots')
  .insert({
    id: order.id,
    type: 'Order',
    version: order.version,
    state: JSON.stringify(snapshot),
  })
  .onConflict('id')
  .merge()
  .where('version', '<', order.version); // ← Add version check

// Or use event store for optimistic concurrency:
await trx('domain_events')
  .insert({
    stream_id: order.id,
    version: order.version, // ← Must be next expected version
    // ...
  })
  .onConflict(['stream_id', 'version']) // ← Unique constraint
  .doNothing(); // Fails if version exists
```

**Database Changes Needed:**

```sql
-- Add unique constraint for optimistic locking
ALTER TABLE domain_events ADD CONSTRAINT unique_stream_version 
  UNIQUE (stream_id, version);

-- Alternative: Add version check to snapshots
ALTER TABLE aggregate_snapshots 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

---

### 3. In-Memory Event Bus (Not Production-Ready)

**Status:** InMemoryEventBus loses events on restart\
**Location:** `src/infrastructure/adapters/event-bus/InMemoryEventBus.ts`

**Current State:**

```typescript
export class InMemoryEventBus implements IEventPublisher {
  private handlers: Map<string, EventHandler[]> = new Map();
  // Events lost on server restart
}
```

**Architecture Requirement:** Redis-backed event bus for durability

**Implementation Plan:**

```typescript
// src/infrastructure/adapters/event-bus/RedisEventBus.ts
export class RedisEventBus implements IEventPublisher {
  constructor(
    private redis: Redis,
    private streamName: string = 'domain-events',
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    // 1. Write to Redis Stream (durability)
    await this.redis.xadd(
      this.streamName,
      '*', // Auto-generate ID
      'event',
      JSON.stringify(this.serialize(event)),
    );

    // 2. Publish to pub/sub for real-time consumers
    await this.redis.publish(
      `events:${event.constructor.name}`,
      JSON.stringify(event),
    );
  }
}
```

**Deployment Requirement:**

- Add Redis to `docker-compose.yml`
- Configure Redis connection in `src/infrastructure/config/redis.ts`

---

### 4. Inconsistent Error Handling

**Status:** Routes use try/catch, Application uses Result<T,E>\
**Location:** All route handlers

**Current State:**

```typescript
// Routes: Manual error handling
try {
  // ...
} catch (error) {
  ctx.response.status = 500;
  ctx.response.body = { error: "Failed to fetch orders" };
}

// Application: Result monad
async execute(command): Promise<Result<Order, DomainError>> {
  return Result.fail(new UserNotFoundError(userId));
}
```

**Required Fix:**

```typescript
// src/shared/Result.ts - Add HTTP mapping
export function mapErrorToHttpStatus(error: DomainError): number {
  switch (error.code) {
    case 'USER.NOT_FOUND':
    case 'ORDER.NOT_FOUND':
      return 404;
    case 'INVENTORY.INSUFFICIENT_STOCK':
      return 409; // Conflict
    case 'VALIDATION.ERROR':
      return 400;
    default:
      return 500;
  }
}

// Routes: Use Result pattern
const result = await handler.execute(command);
if (result.isFailure()) {
  ctx.response.status = mapErrorToHttpStatus(result.error);
  ctx.response.body = {
    error: result.error.message,
    code: result.error.code,
  };
  return;
}
ctx.response.body = result.value.toDTO();
```

---

## 🟠 High Priority Gaps

### 5. Missing IUserRepository Port Definition

**Status:** IUserRepository defined inside handler file\
**Location:** `src/application/handlers/PlaceOrderHandler.ts` (line 39-41)

**Required Fix:**

```typescript
// src/domain/ports/IUserRepository.ts
export interface IUserRepository {
  findById(userId: string): Promise<
    {
      id: string;
      email: string;
      addresses: Array<{
        id: string;
        street: string;
        city: string;
        // ...
      }>;
    } | null
  >;

  exists(userId: string): Promise<boolean>;
}
```

**Then:** Remove interface from PlaceOrderHandler.ts, import from domain/ports

---

### 6. GraphQL Federation Not Implemented

**Status:** Architecture specifies Apollo Federation, only REST exists\
**Location:** Gateway and services

**Current State:**

- `/graphql` endpoint is a stub
- Services have `schema.graphql` files but no resolvers
- No Apollo Gateway configured

**Decision Needed:**

- **Option A:** Remove GraphQL references from architecture.md, stick with REST
- **Option B:** Implement proper GraphQL subgraphs

**If Option B, implement:**

```typescript
// services/orders/index.ts
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
```

---

### 7. No Circuit Breaker

**Status:** Required by architecture for gateway resilience\
**Location:** Gateway level (not implemented)

**Required Implementation:**

```typescript
// src/gateway/circuit-breaker/CircuitBreaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 30000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

## 🟡 Medium Priority Gaps

### 8. Inventory Aggregate Incomplete

**Status:** ProduceItem aggregate exists but lacks behavior\
**Location:** `src/domain/aggregates/ProduceItem/ProduceItem.ts`

**Missing:**

- Stock reservation logic
- Stock release on order cancellation
- Stock deduction on order confirmation
- Event sourcing integration

---

### 9. Missing Domain Event Persistence

**Status:** Events published but not persisted durably\
**Location:** Event publishing flow

**Current Flow:**

1. Order.save() writes events to `domain_events` table ✓
2. Events published via InMemoryEventBus ✓
3. **Missing:** Outbox pattern for reliable delivery

**Required:** Outbox pattern implementation

```typescript
// In transaction:
await trx('domain_events').insert(event);
await trx('outbox').insert({ // ← Add outbox table
  event_type: event.constructor.name,
  payload: JSON.stringify(event),
  processed: false,
});
// Separate poller reads outbox and publishes
```

---

### 10. Database Schema Misalignment

**Status:** Repository assumes Knex API, but architecture mentions Deno Postgres\
**Location:** All repository implementations

**Current:** `this.db('orders').where(...)` (Knex style) **Architecture:** Deno native Postgres
client

**Decision Needed:**

- Stick with Knex (works with Deno via npm compat)
- Migrate to native Deno Postgres client

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

- [ ] Implement RedisEventBus
- [ ] Move IUserRepository to domain/ports
- [ ] Add optimistic locking to OrderRepository
- [ ] Implement error mapping middleware

### Phase 2: Wiring (Week 2)

- [ ] Create DI container in main.ts
- [ ] Wire PlaceOrderHandler to routes
- [ ] Wire GetUserOrdersHandler to routes
- [ ] Add Result pattern to all routes

### Phase 3: Resilience (Week 3)

- [ ] Implement Circuit Breaker
- [ ] Add outbox pattern for events
- [ ] Implement webhook retry logic
- [ ] Add payment timeout processing

### Phase 4: GraphQL Decision (Week 4)

- [ ] Decision: REST only vs GraphQL Federation
- [ ] If GraphQL: Implement subgraphs
- [ ] If REST: Remove GraphQL references from docs

---

## Original Items (Retained)

- Update `architecture.md` to reflect Nuxt 4 frontend at `src/presentation-nuxt` (replace legacy
  `src/presentation`).
- Update `docker-compose.yml` frontend service to build/run from `src/presentation-nuxt`.
- Implement actual subgraph services under `services/*` (currently only `schema.graphql` files).
- Align `PostgresOrderRepository`/`InventoryRepository` with Deno Postgres client (decide on Knex vs
  native).
- Add integration tests for REST routes that exercise the application layer and persistence.
