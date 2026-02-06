# Yndu System

<p align="center">
  <strong>Fresh Produce Delivery Platform</strong><br>
  Domain-Driven Design • Deno Runtime • Vue 3 • PostgreSQL • GraphQL
</p>

<p align="center">
  <a href="#architecture"><strong>Architecture</strong></a> •
  <a href="#quick-start"><strong>Quick Start</strong></a> •
  <a href="#development"><strong>Development</strong></a> •
  <a href="#deployment"><strong>Deployment</strong></a> •
  <a href="#api"><strong>API</strong></a>
</p>

---

## Overview

Yndu is a production-ready fresh produce delivery system built with modern architectural patterns and technologies. It enables customers to order customizable produce boxes, subscribe to recurring deliveries, and track their orders in real-time.

### Key Features

- 🥬 **Customizable Produce Boxes** - Small, Medium, Large boxes with personalized selections
- 🚚 **Same-Day & Next-Day Delivery** - Orders placed before 10 AM EAT qualify for same-day
- 🔄 **Subscription Service** - Weekly, bi-weekly, or monthly recurring deliveries
- 📱 **Real-Time Tracking** - Track orders from farm to doorstep
- 💰 **KES Currency Support** - Native Kenyan Shilling handling with precise cents
- 🌍 **Multi-Language** - English and Swahili support
- 📊 **Analytics Dashboard** - Materialized views for business insights

---

## Architecture

### Hexagonal Architecture (Ports & Adapters)

```
┌────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                          │
│  ┌─────────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Vue 3 Frontend    │  │   Motion Vue Animations              │ │
│  │   • Composition API │  │   • Declarative animations           │ │
│  │   • Pinia Stores    │  │   • Gesture interactions             │ │
│  │   • GraphQL Client  │  │   • Scroll-linked effects            │ │
│  └─────────────────────┘  └──────────────────────────────────────┘ │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ GraphQL
┌────────────────────────────────▼───────────────────────────────────┐
│                        API GATEWAY LAYER                            │
│              Apollo Federation Gateway (Port 4000)                  │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│     │   Users     │  │  Inventory  │  │   Orders    │              │
│     │  (4001)     │  │   (4002)    │  │   (4003)    │              │
│     └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ HTTP/REST
┌────────────────────────────────▼───────────────────────────────────┐
│                     APPLICATION LAYER (Deno)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Oak Web Framework                          │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │  │
│  │  │   Commands   │ │   Queries    │ │   Handlers   │          │  │
│  │  │  (Write)     │ │  (Read)      │ │  (Process)   │          │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ Domain Events
┌────────────────────────────────▼───────────────────────────────────┐
│                        DOMAIN LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Aggregates                               │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │  │
│  │  │    Order     │ │ ProduceItem  │ │Subscription  │          │  │
│  │  │  Aggregate   │ │  Aggregate   │ │  Aggregate   │          │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘          │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                Value Objects                            │  │  │
│  │  │  Money (KES cents) │ Quantity │ DeliverySlot │          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ Repositories
┌────────────────────────────────▼───────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │  PostgreSQL  │ │    Redis     │ │  In-Memory   │               │
│  │   (JSONB)    │ │   (Cache)    │ │  Event Bus   │               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
│                                                                     │
│  Enhanced Schema: 18 tables • 60+ indexes • Partitioned events     │
└────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vue 3 + TypeScript | Reactive UI with Composition API |
| **Animations** | Motion Vue (motion-v) | Hardware-accelerated animations |
| **State** | Pinia | Type-safe state management |
| **Gateway** | Apollo Federation | GraphQL schema composition |
| **Runtime** | Deno 1.41+ | Secure TypeScript runtime |
| **Framework** | Oak | Web framework (Express alternative) |
| **Validation** | Zod | Schema validation |
| **Database** | PostgreSQL 16 | ACID-compliant data storage |
| **Cache** | Redis 7 | Event bus and session cache |
| **Testing** | Deno Test | Built-in test runner |
| **Container** | Docker | Service orchestration |

---

## Quick Start

### Prerequisites

- **Deno** 1.41+ - [Install](https://deno.land/install)
- **Docker & Docker Compose** - [Install](https://docs.docker.com/get-docker/)
- **Node.js** 20+ (for frontend only) - [Install](https://nodejs.org/)

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/yndu.git
cd yndu

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and all services
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

### 3. Database Setup

```bash
# Run enhanced schema migrations
docker-compose exec postgres psql -U postgres -d yndu -f /docker-entrypoint-initdb.d/002_enhanced_schema.sql

# Or manually:
psql -h localhost -U postgres -d yndu -f src/infrastructure/adapters/postgres/migrations/002_enhanced_schema.sql

# Seed with sample data
psql -h localhost -U postgres -d yndu -f src/infrastructure/adapters/postgres/seeds/001_seed_data.sql
```

### 4. Start Backend (Deno)

```bash
# Development mode with hot reload
deno task dev

# Or run specific service
deno run --allow-net --allow-read --allow-env src/main.ts
```

### 5. Start Frontend (Vue 3)

```bash
# Navigate to frontend
cd src/presentation

# Install dependencies
npm install

# Run development server
npm run dev
```

### 6. Access Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Vue 3 Application |
| API | http://localhost:8000 | Deno REST API |
| Health | http://localhost:8000/health | Health check |
| GraphQL | http://localhost:4000/graphql | Federation Gateway |

---

## Development

### Deno Tasks

```bash
# Development with hot reload
deno task dev

# Run production mode
deno task start

# Run all tests
deno task test

# Run unit tests only
deno task test:unit

# Run integration tests
deno task test:integration

# Format code
deno task fmt

# Lint code
deno task lint

# Type check
deno task check

# Compile to executable
deno task compile
```

### Project Structure

```
yndu/
├── deno.json                          # Deno configuration & tasks
├── docker-compose.yml                 # Service orchestration
├── Dockerfile.deno                    # Production Docker image
├── .env.example                       # Environment template
│
├── src/
│   ├── main.ts                        # Deno entry point
│   ├── deps.ts                        # Centralized dependencies
│   │
│   ├── routes/                        # API Routes (Oak)
│   │   ├── mod.ts                     # Route aggregation
│   │   ├── orders/
│   │   │   ├── mod.ts
│   │   │   ├── handlers.ts
│   │   │   └── validators.ts
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
│       ├── stores/
│       │   └── orderStore.ts
│       ├── composables/
│       │   ├── useBoxBuilder.ts
│       │   └── useDeliverySlot.ts
│       └── views/
│           └── OrderPlacement.vue
│
├── services/                          # GraphQL Subgraphs
│   ├── users/
│   ├── inventory/
│   └── orders/
│
├── gateway/                           # Apollo Federation
│   ├── Dockerfile
│   └── src/index.js
│
├── tests/
│   ├── unit/
│   │   └── money_test.ts
│   └── integration/
│       └── orders_test.ts
│
└── src/infrastructure/adapters/postgres/migrations/
    ├── 001_initial_schema.sql
    ├── 002_enhanced_schema.sql       # Production schema
    ├── seeds/001_seed_data.sql
    ├── MIGRATION_GUIDE.md
    └── SCHEMA_ENHANCEMENTS.md
```

---

## Database Schema

### Enhanced Production Schema

Applied `database-schema-design` skill for enterprise-grade database:

| Feature | Implementation |
|---------|----------------|
| **Tables** | 18 tables (users, orders, produce_items, subscriptions, riders, etc.) |
| **Indexes** | 60+ optimized indexes including GIN, GiST, Partial |
| **Constraints** | 30+ CHECK constraints for data integrity |
| **Partitioning** | Monthly partitions for domain_events |
| **Audit** | created_at, updated_at, created_by, updated_by on all tables |
| **Soft Delete** | deleted_at pattern with partial unique indexes |
| **Versioning** | Optimistic locking with version column |
| **Money** | INTEGER (cents) - no floating-point errors |

### Key Tables

```sql
-- Users with full audit
create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) unique not null,
    phone varchar(20) unique not null,
    profile jsonb not null default '{}',
    status varchar(20) not null default 'active'
        check (status in ('active', 'suspended', 'deactivated')),
    deleted_at timestamptz,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    version integer not null default 1
);

-- Orders with event sourcing support
create table orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id),
    status varchar(50) not null default 'PENDING'
        check (status in ('PENDING', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
    total_price_cents integer not null check (total_price_cents >= 0),
    delivery_date date not null,
    slot_type varchar(20) not null check (slot_type in ('SAME_DAY', 'NEXT_DAY')),
    items jsonb not null,
    placed_at timestamptz default now() not null,
    version integer not null default 1
);
```

See `SCHEMA_ENHANCEMENTS.md` for complete details.

---

## API

### REST Endpoints (Deno/Oak)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/health/ready` | Readiness probe |
| `GET` | `/api/orders` | List orders (with filters) |
| `GET` | `/api/orders/:id` | Get order by ID |
| `POST` | `/api/orders` | Create new order |
| `PUT` | `/api/orders/:id/status` | Update order status |
| `GET` | `/api/inventory` | List produce items |
| `GET` | `/api/users/me` | Get current user |

### Example Request

```bash
# Create order
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "items": [
      {"produceId": "prod-001", "quantity": 1.5, "unit": "kg"},
      {"produceId": "prod-002", "quantity": 1.0, "unit": "kg"}
    ],
    "deliveryAddressId": "addr-001",
    "preferredDeliveryDate": "2025-02-10",
    "isSubscription": false
  }'
```

### GraphQL Federation

```graphql
# Get user with orders
query {
  me {
    id
    email
    profile {
      firstName
      lastName
    }
    orders {
      id
      status
      totalPrice
      deliverySlot {
        date
        type
      }
    }
  }
}
```

---

## Frontend

### Vue 3 + Motion Vue

```vue
<script setup>
import { motion } from 'motion-v'
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :whileHover="{ scale: 1.02 }"
    class="order-card"
  >
    <h2>{{ orderStore.currentOrder?.id }}</h2>
    <p>Status: {{ orderStore.currentOrder?.status }}</p>
  </motion.div>
</template>
```

### Composables

```typescript
// useBoxBuilder - Build custom produce boxes
const { 
  selections, 
  currentWeight, 
  currentPrice,
  canAddItem,
  addItem 
} = useBoxBuilder('MEDIUM', inventory)

// useDeliverySlot - Manage delivery scheduling
const { slotType, deliveryDisplay, setDate } = useDeliverySlot()
```

---

## Testing

### Deno Test Runner

```bash
# Run all tests
deno task test

# Run with coverage
deno test --coverage=coverage && deno coverage coverage

# Run specific test file
deno test tests/unit/money_test.ts
```

### Test Example

```typescript
// tests/unit/money_test.ts
import { assertEquals } from "../deps.ts";
import { Money } from "../../src/domain/value-objects/branded.ts";

Deno.test("Money.fromCents should create money from cents", () => {
  const money = Money.fromCents(5000);
  assertEquals(money.amount, 5000);
  assertEquals(money.currency, "KES");
});
```

### Integration Tests

```bash
# Start server first
deno task dev

# Run integration tests in another terminal
deno task test:integration
```

---

## Deployment

### Docker

```bash
# Build production image
docker build -f Dockerfile.deno -t yndu:latest .

# Run with environment
docker run -p 8000:8000 --env-file .env yndu:latest

# Or use docker-compose
docker-compose up -d
```

### Compile to Binary

```bash
# Compile to standalone executable
deno task compile

# Run compiled binary
./yndu
```

### Environment Variables

```bash
# Server
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

# Database
DATABASE_HOST=postgres.example.com
DATABASE_PORT=5432
DATABASE_USER=yndu
DATABASE_PASSWORD=secure-password
DATABASE_NAME=yndu_production

# Redis
REDIS_HOST=redis.example.com
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=https://yndu.co.ke
```

---

## Skills Used

This project leverages three specialized agent skills:

### 1. database-schema-design ✅
Production-grade PostgreSQL schema with:
- 3NF normalization
- CHECK constraints
- Partitioning
- 60+ indexes
- Audit trails

### 2. motion ✅
Vue animations with Motion Vue:
- Declarative animations
- Gesture support
- Scroll effects
- Spring physics

### 3. deno-typescript ✅
Deno runtime integration:
- Native TypeScript
- Built-in tooling
- Permission-based security
- URL imports

---

## Documentation

- **[DENO_SETUP.md](DENO_SETUP.md)** - Deno configuration and migration guide
- **[SCHEMA_ENHANCEMENTS.md](src/infrastructure/adapters/postgres/SCHEMA_ENHANCEMENTS.md)** - Database schema details
- **[MIGRATION_GUIDE.md](src/infrastructure/adapters/postgres/MIGRATION_GUIDE.md)** - Database migration steps
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- Deno fmt for formatting
- Deno lint for linting
- Conventional commits
- TypeScript strict mode

---

## License

MIT © 2025 Yndu

---

<p align="center">
  <strong>Built with ❤️ for fresh produce delivery</strong><br>
  <sub>Deno • Vue 3 • PostgreSQL • GraphQL • DDD</sub>
</p>
