# Yndu Core Architecture: A Resilient, Event-Driven Platform

This document defines the architectural blueprint for the **Yndu** fresh produce delivery platform.
It synthesizes modern application development practices (Domain-Driven Design, Hexagonal
Architecture) with industrial-grade resilience patterns to create a system that is robust, scalable,
and maintainable.

---

## 1. System Overview & Philosophy

**Yndu** is designed to manage the complex lifecycle of fresh produce delivery—from farm inventory
and seasonality to flexible subscription boxes and last-mile logistics.

### Core Architectural Pillars

1. **Type Safety**: End-to-end TypeScript (Deno Backend + Nuxt Frontend) ensures contracts are
   respected across boundaries.
2. **Immutability**: We use **Event Sourcing** as the source of truth. State is not just "stored";
   it is _derived_ from a history of immutable facts (Events).
3. **Resilience**: The system is built to fail gracefully and recover deterministically, employing
   patterns like Circuit Breakers and Externalized State.

---

## 2. Technology Stack

| Layer                     | Technology                     | Role                                                         |
| :------------------------ | :----------------------------- | :----------------------------------------------------------- |
| **Frontend**              | **Nuxt 4** (Vue 3, TypeScript) | Responsive, server-side rendered UI with Tailwind & Reka UI. |
| **API Layer**             | **Apollo Federation**          | Unified GraphQL Gateway composing multiple subgraphs.        |
| **Backend Runtime**       | **Deno**                       | Secure, modern TypeScript runtime for microservices.         |
| **Application Framework** | **Oak**                        | Middleware framework for HTTP routing in Deno.               |
| **Persistence (Write)**   | **PostgreSQL**                 | Transactional storage for Event Streams (`domain_events`).   |
| **Persistence (Read)**    | **PostgreSQL**                 | Optimized Read Models (Denormalized tables).                 |
| **State/Cache**           | **Redis**                      | Distributed session store and ephemeral caching.             |

---

## 3. Architecture Patterns

### 3.1 Hexagonal Architecture (Ports & Adapters)

We strictly adhere to the Dependency Rule: _Inner layers define interfaces; outer layers implement
them._

- **Domain (Core)**: Pure business logic (Aggregates, Value Objects). Zero external dependencies.
- **Application**: Use cases (Command Handlers) that orchestrate the domain.
- **Infrastructure**: Adapters for Databases, Event Buses, and External APIs.
- **Presentation**: GraphQL Resolvers and REST Controllers.

### 3.2 Event Sourcing & CQRS

Instead of just storing "current state," we store "what happened."

- **Write Side (Command)**: Validates logic and appends events (e.g., `OrderPlaced`,
  `StockDecremented`) to the `domain_events` table.
- **Read Side (Query)**: "Projectors" listen to events and update optimized read-only tables (e.g.,
  a generic `orders` table or a `daily_sales` report).

---

## 4. Resilience & State Error Handling

Adopting patterns from high-scale distributed systems, Yndu implements specific strategies to handle
failure and manage state.

### 4.1 Circuit Breakers (Gateway Level)

- **Concept**: Just as an electrical circuit breaker prevents a surge from burning out wiring, our
  software circuit breakers prevent cascading failures.
- **Implementation**: The **Apollo Gateway** acts as the mediator. If a specific subgraph (e.g.,
  `Inventory Service`) becomes unresponsive or throws high rates of 5xx errors:
  1. The Gateway "trips" the circuit to **OPEN**.
  2. Requests to that subgraph are immediately rejected (failing fast) without consuming
     thread/connection resources.
  3. After a timeout, the Gateway tests the service (Half-Open). If successful, it resumes traffic.
- **Benefit**: A failure in the Inventory system does not crash the User Management system. The
  frontend receives a controlled error, allowing it to render a "Partial Availability" UI (e.g.,
  hiding produce listings but allowing profile edits).

### 4.2 Externalized State (Stateless Services)

- **The Anti-Pattern**: "Sticky Sessions" (keeping user login/cart state in server memory) ties a
  user to a specific specific server instance. If that server crashes, data is lost. It also makes
  scaling difficult.
- **Yndu Approach**: **State Externalization**.
  - All ephemeral state—User Sessions, Shopping Cart Drafts, Wizard Progress—is stored in **Redis**.
  - Backend services (Deno containers) are completely **stateless**.
  - Any request can be handled by any instance.
- **Recovery**: If a backend instance crashes mid-process, no session data is lost. The next request
  is routed to a healthy instance, which retrieves the context from Redis and continues seamlessly.

### 4.3 Deterministic Recovery via Event Replay

- **Concept**: Traditional databases rely on backups for recovery. Event Sourced systems rely on
  **Replay**.
- **Scenario**: A bug in the "Monthly Revenue" calculation logic corrupts the report data.
- **Recovery Strategy**:
  1. Deploy the fix to the calculation logic.
  2. Truncate (clear) the corrupted Read Model table.
  3. **Replay** the `domain_events` stream from the beginning of time.
  4. The system reconstructs the correct state deterministically.
- **Analogy**: This is similar to "Checkpoint/Restore" in stream processing (like Flink), ensuring
  **Exactly-Once** processing semantics for our business data.

---

## 5. Domain Data Flow

### 5.1 The Order Lifecycle

1. **Command**: User submits `PlaceOrderMutation` via Nuxt.
2. **Gateway**: Routes to **Order Subgraph** (Deno).
3. **Application Layer**: `PlaceOrderHandler` validates stock (calls Inventory) and User
   eligibility.
4. **Domain**: `Order` Aggregate creates `OrderPlaced` event.
5. **Persistence**: Event is saved to `domain_events` (Atomic Transaction).
6. **Projection**: Event is published; `OrderReadModelProjector` updates the `orders` table for fast
   querying.

### 5.2 Subscription Model

- **Subscriptions** are distinct aggregates that generate **Orders** based on a schedule
  (Cron/Scheduler).
- **Resilience**: The scheduler is idempotent. It checks "Have I generated an order for Subscription
  X for this week?" before acting, preventing duplicate orders even if the scheduler restarts.

---

## 6. Complex Operations: Transactional Command Handlers

Instead of a complex "Saga" engine, Yndu uses **Transactional Command Handlers** for multi-step
operations (e.g., Placing an Order).

### The Pattern

1. **Single Transaction**: The Handler wraps the entire operation (Validation -> Inventory Check ->
   Order Creation -> Event Persist) in a single database transaction (`BEGIN` ... `COMMIT`).
2. **Atomic Failure**: If _any_ step fails (e.g., Inventory out of stock), the transaction rolls
   back (`ROLLBACK`). The system state remains consistent; no partial "zombie" orders are created.
3. **Result Monad**: Handlers return `Result<T, E>` to the caller (API/Gateway). Exceptions are
   caught at the boundary.

### Why this works for Yndu

Since we use a shared PostgreSQL instance for `domain_events` and other critical tables, we can
leverage ACID guarantees directly. We do not need ensuring eventual consistency across distinct
micro-databases.

---

## 7. Implementation Guidelines

### 6.1 Do's

- **Do** use Zod for all input validation at the edge.
- **Do** use **Optimistic Locking** (version numbers) when updating Aggregates to prevent concurrent
  modification issues.
- **Do** write integration tests that treat the GraphQL Schema as the public API.

### 6.2 Don'ts

- **Don't** perform business logic in GraphQL Resolvers; delegate to the Domain Layer.
- **Don't** store state in global variables or local files. Use Redis or Postgres.
- **Don't** catch errors silently. Allow them to bubble up to the global error handler which formats
  them as standard GraphQL errors.
