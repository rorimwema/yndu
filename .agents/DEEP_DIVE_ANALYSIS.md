# Deep Dive Analysis: Additional Gaps Beyond todo.md

This document captures all architectural shortcomings, code issues, and missing implementations
discovered during a comprehensive code review that were **NOT** captured in the existing `todo.md`.

---

## 1. Missing Aggregates (Empty Directories)

### 1.1 Rider Aggregate - EMPTY

**Location:** `src/domain/aggregates/Rider/`

**Status:** Directory exists but contains **zero files**

**Impact:** Critical - Cannot manage rider assignment, tracking, or delivery logistics

**Required Implementation:**

```typescript
// src/domain/aggregates/Rider/Rider.ts
export class Rider {
  // Properties: id, name, phone, zone, currentLocation, status
  // Methods: assignOrder(), updateLocation(), completeDelivery()
}
```

### 1.2 Subscription Aggregate - EMPTY

**Location:** `src/domain/aggregates/Subscription/`

**Status:** Directory exists but contains **zero files**

**Impact:** Critical - Cannot handle recurring subscription orders

**Required Implementation:**

```typescript
// src/domain/aggregates/Subscription/Subscription.ts
export class Subscription {
  // Properties: id, userId, boxTemplate, frequency, status, nextDeliveryDate
  // Methods: pause(), resume(), cancel(), generateOrder()
}
```

---

## 2. Domain Layer Issues

### 2.1 ProduceItem Has Stock Methods But No Event Emission

**Location:** `src/domain/aggregates/ProduceItem/ProduceItem.ts`

**Issue:** The aggregate has `decrementStock()` and `incrementStock()` methods but **never emits
events**.

```typescript
// Current (WRONG):
decrementStock(quantity: Quantity, reason: string): void {
  // Modifies state but doesn't track the change as an event
  this.availableQuantity = this.availableQuantity.add(Quantity.kilograms(-quantity.toKilograms()));
}

// Should emit:
- StockDecremented event (when stock is used for an order)
- StockIncremented event (when stock is restocked)
- StockLow event (when below reorder threshold)
```

**Impact:** Event sourcing is broken for inventory - read models won't update

### 2.2 No Stock Reservation Pattern

**Location:** `src/application/handlers/PlaceOrderHandler.ts`

**Issue:** Order is placed and inventory is checked, but stock is **never actually decremented**

The flow is:

1. ✓ Check stock availability
2. ✓ Create Order with `OrderPlaced` event
3. ✗ **MISSING** - Decrement stock in inventory
4. ✗ **MISSING** - Emit `StockDecremented` event

**Required Fix:**

```typescript
// In PlaceOrderHandler.execute():
// After creating order, decrement inventory
for (const item of command.items) {
  await this.inventoryRepository.decrementStock(
    item.produceId,
    item.quantity,
    `Order ${order.id}`,
  );
}
```

---

## 3. Infrastructure Issues

### 3.1 Database Transaction Inconsistency in OrderRepository

**Location:** `src/infrastructure/adapters/postgres/OrderRepository.ts`

**Issue:** Uses `.onConflict('id').merge()` without proper optimistic locking check

```typescript
// Current code (lines 27-35):
await trx('aggregate_snapshots')
  .insert({
    id: order.id,
    type: 'Order',
    version: order.version,
    state: JSON.stringify(snapshot),
  })
  .onConflict('id')
  .merge(); // ← Overwrites ANY version, even stale ones!
```

**Problem:** If two concurrent requests modify the same order, the second one silently overwrites
the first. The todo.md mentions this but the actual code has NO version check.

**Required Fix:**

```typescript
// Should be:
.where('version', '<', order.version)  // Only update if our version is newer
```

### 3.2 No Database Connection Initialization in main.ts

**Location:** `src/main.ts`

**Issue:** Database is configured but **never connected**

```typescript
// main.ts imports:
import { dbClient } from './infrastructure/config/database.ts';

// But NEVER calls connectDatabase()!
```

**Current State:**

```typescript
// database.ts exports:
export const dbClient = new PostgresClient(dbConfig); // Just created, not connected

export async function connectDatabase() {
  await dbClient.connect(); // This function exists but is never called!
}
```

### 3.3 Repositories Not Passed to Handlers

**Location:** `src/main.ts`

**Issue:** Repositories and event bus are created but never injected into handlers

```typescript
// Should initialize and wire:
const orderRepository = new PostgresOrderRepository(dbClient);
const inventoryRepository = new PostgresInventoryRepository(dbClient);
const eventBus = new InMemoryEventBus();

// Handlers need these injected:
const placeOrderHandler = new PlaceOrderHandler(
  orderRepository,
  inventoryRepository,
  userRepository, // ← Also missing implementation
  eventBus,
);
```

---

## 4. Application Layer Issues

### 4.1 IUserRepository Not Implemented

**Location:** `src/application/handlers/PlaceOrderHandler.ts` (line 39-41)

**Issue:** Interface defined in handler file instead of domain ports

```typescript
// Current (in handler file - WRONG):
export interface IUserRepository {
  findById(userId: string): Promise<{ id: string; addresses: Array<{ id: string }> } | null>;
}

// Should be in: src/domain/ports/IUserRepository.ts
```

**Also:** No implementation exists - `userRepository` passed to handler will be undefined/null

### 4.2 Command Validation Mismatch

**Location:** `src/routes/orders/validators.ts` vs `src/application/commands/PlaceOrderCommand.ts`

**Issue:** Zod validator produces plain objects, but PlaceOrderCommand expects Value Objects

```typescript
// Validator output:
{ userId: "uuid-string", quantity: 5, unit: "kg" }

// Command expects:
{ userId: UserId, quantity: Quantity, ... }
```

**Missing:** Mapping layer between validator output and command DTOs

---

## 5. Port/Interface Issues

### 5.1 Missing IInventoryRepository Methods

**Location:** `src/domain/ports/IInventoryRepository.ts`

**Issue:** Interface doesn't define stock modification methods

```typescript
// Current (incomplete):
export interface IInventoryRepository {
  save(item: ProduceItem): Promise<void>;
  findById(id: ProduceItemId): Promise<ProduceItem | null>;
  findByCategory(category: string): Promise<ProduceItem[]>;
  findAll(): Promise<ProduceItem[]>;
  // MISSING:
  // decrementStock(id: ProduceItemId, quantity: Quantity, reason: string): Promise<void>
  // incrementStock(id: ProduceItemId, quantity: Quantity, reason: string): Promise<void>
}
```

---

## 6. Frontend/Presentation Issues

### 6.1 Docker Compose Points to Wrong Frontend Path

**Location:** `docker-compose.yml` (line 91-97)

**Issue:** Frontend build context points to `./src/presentation` but actual frontend is at
`./src/presentation-nuxt`

```yaml
# Current (WRONG):
frontend:
  build:
    context: ./src/presentation # ← Doesn't exist
    dockerfile: Dockerfile

  # Should be:
  build:
    context: ./src/presentation-nuxt
    dockerfile: Dockerfile
```

### 6.2 Frontend Has No API Client Configuration

**Location:** `src/presentation-nuxt/`

**Issue:** No GraphQL client or REST API client configured

**Missing:**

- Apollo Client setup for GraphQL
- or Fetch/wretch wrapper for REST
- No environment variable handling for API URLs

### 6.3 Stores Not Connected to Backend

**Location:** `src/presentation-nuxt/app/stores/`

**Issue:** Pinia stores (cart-store, checkout-store, etc.) have no API calls

```typescript
// cart-store.ts - Current state:
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  // No fetch(), no API calls anywhere!

  return { items, addItem, removeItem }; // Just local state
});
```

---

## 7. GraphQL Issues

### 7.1 GraphQL Endpoint is Stub

**Location:** `src/routes/mod.ts` (lines 21-25)

**Issue:** GraphQL route returns null, no actual implementation

```typescript
// Current (STUB):
router.post('/graphql', async (ctx) => {
  const body = await ctx.request.body.json();
  ctx.response.body = { data: null }; // ← Hardcoded null!
});
```

### 7.2 Services Have Schemas But No Resolvers

**Location:** `services/orders/schema.graphql`, `services/users/schema.graphql`, etc.

**Issue:** Schema files exist but no corresponding TypeScript resolver implementations

**Missing files:**

- `services/orders/resolvers.ts`
- `services/users/resolvers.ts`
- `services/inventory/resolvers.ts`

### 7.3 Gateway Not Functional

**Location:** `gateway/src/index.js`

**Issue:** Apollo Gateway not properly configured

---

## 8. Testing Gaps

### 8.1 Integration Tests Don't Test Full Flow

**Location:** `tests/integration/orders_test.ts`

**Issue:** Only checks health endpoint and basic 200 response

```typescript
// Current (insufficient):
Deno.test('GET /api/orders should return orders list', async () => {
  const response = await fetch(`${BASE_URL}/api/orders`);
  // Just checks status, doesn't test:
  // - Order creation flow
  // - Inventory check
  // - Event publishing
  // - Repository persistence
});
```

**Missing Tests:**

- PlaceOrderHandler unit tests
- Repository integration tests with real DB
- Event publishing tests
- Concurrent order edge cases

### 8.2 No Unit Tests for Domain

**Location:** `tests/unit/`

**Issue:** Only `money_test.ts` exists

**Missing:**

- Order aggregate tests
- ProduceItem tests
- Value object tests
- Event sourcing tests

---

## 9. Configuration Issues

### 9.1 Redis Not Configured

**Location:** `src/infrastructure/config/redis.ts`

**Issue:** Configuration exists but Redis client is never used for:

- Session storage
- Event bus (currently in-memory only)
- Caching

### 9.2 Environment Variables Not Validated

**Location:** `src/infrastructure/config/env.ts`

**Issue:** No runtime validation of required env vars

**Missing:**

- Schema validation for required env vars
- Default values handling
- Type safety for env configuration

---

## 10. Architectural Violations

### 10.1 Domain Layer Importing from Infrastructure

**Issue:** Check imports in domain files - should have ZERO external imports

### 10.2 Mixed Error Handling Patterns

**Issue:**

- Routes use try/catch
- Handlers use Result<T,E>
- No unified error mapping

---

## Summary Table

| Category       | Gap                             | Severity | Status      |
| -------------- | ------------------------------- | -------- | ----------- |
| Aggregates     | Rider aggregate missing         | CRITICAL | Not Started |
| Aggregates     | Subscription aggregate missing  | CRITICAL | Not Started |
| Domain         | ProduceItem doesn't emit events | HIGH     | Not Started |
| Domain         | No stock reservation on order   | HIGH     | Not Started |
| Infrastructure | No DB connection in main.ts     | CRITICAL | Not Started |
| Infrastructure | No optimistic locking           | HIGH     | Not Started |
| Infrastructure | Handlers not wired              | CRITICAL | Not Started |
| Application    | IUserRepository not implemented | HIGH     | Not Started |
| Application    | Command validation mismatch     | MEDIUM   | Not Started |
| Ports          | IInventoryRepository incomplete | HIGH     | Not Started |
| Frontend       | Docker points to wrong path     | HIGH     | Not Started |
| Frontend       | No API client                   | HIGH     | Not Started |
| Frontend       | Stores not connected            | HIGH     | Not Started |
| GraphQL        | Endpoint is stub                | CRITICAL | Not Started |
| GraphQL        | No resolvers                    | CRITICAL | Not Started |
| Testing        | No handler tests                | HIGH     | Not Started |
| Config         | Redis unused                    | MEDIUM   | Not Started |

---

## Recommendations Priority

### P0 - Must Fix Before Production

1. Wire application handlers to routes (DI container)
2. Implement Rider and Subscription aggregates
3. Fix stock decrement on order placement
4. Add database connection in main.ts
5. Fix docker-compose frontend path

### P1 - High Priority

6. Implement IUserRepository
7. Add optimistic locking to repositories
8. Implement Redis event bus
9. Add proper GraphQL resolvers
10. Connect frontend stores to backend

### P2 - Medium Priority

11. Add comprehensive tests
12. Implement circuit breaker
13. Add outbox pattern for events
14. Validate environment variables
