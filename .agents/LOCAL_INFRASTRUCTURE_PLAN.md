# Yndu Local Infrastructure Plan (Stabilized)

## What Changed

- Added enterprise migration:
  `src/infrastructure/adapters/postgres/migrations/004_enterprise_schema.sql`
- Added deterministic DB bootstrap scripts:
  - Dev: `src/infrastructure/adapters/postgres/bootstrap/dev_init.sql`
  - Production-like: `src/infrastructure/adapters/postgres/bootstrap/prod_init.sql`
- Added dev seed: `src/infrastructure/adapters/postgres/seeds/002_dev_seed_v2.sql`
- Reworked compose stacks:
  - Dev: `docker-compose.yml`
  - Production-like local replica: `docker-compose.production.yml` (legacy local only)
- Added Swarm production stack:
  - `docker-stack.yml` (production standard)
- Added Nuxt production image: `Dockerfile.nuxt`
- Added reverse proxy config: `nginx/production.conf`

## Migration Execution Model

The old migration directory contains conflicting historical files (`001`, `002`, `003*`). To avoid
duplicate table creation and broken SQL execution, database bootstrap now uses explicit include
order:

### Dev include order

1. `001_initial_schema.sql`
2. `004_enterprise_schema.sql`
3. `002_dev_seed_v2.sql`

### Production-like include order

1. `001_initial_schema.sql`
2. `004_enterprise_schema.sql`

## Run Development Stack

```bash
docker compose up -d
```

Services:

- Frontend (Nuxt dev): `http://localhost:3000`
- Backend (Deno API): `http://localhost:8000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Run Production-like Stack (legacy local parallel)

```bash
docker compose -f docker-compose.production.yml up -d --build
```

Services:

- Nginx entrypoint: `http://localhost:8080`
- Postgres (prod-like): `localhost:5433`
- Redis (prod-like): `localhost:6380`

## Run Production Standard (Docker Swarm)

```bash
docker swarm init
docker stack deploy -c docker-stack.yml yndu
```

## Enterprise Schema Coverage

- Unified identity + RBAC (`users.role`, `organizations`, `organization_memberships`)
- B2B company profiles (`b2b_company_profiles`)
- Rider identity profiles (`rider_profiles`)
- Supplier procurement (`suppliers`, `purchase_orders`, `purchase_order_items`)
- Inventory traceability (`inventory_movements.batch_number`, `supplier_id`, `purchase_order_id`)
- B2B pricing (`produce_items.b2b_unit_price_cents`, `produce_price_tiers`)
- Invoicing (`invoices`, `invoice_line_items`, `invoice_payments`)
- Fleet and manifest routing (`vehicles`, `delivery_routes`, `delivery_route_stops`, enhanced
  `delivery_assignments`)

## Notes

- Existing application TypeScript compile errors are not part of this migration/infra patch and
  still need a code stabilization pass.
- If you need zero-downtime data migration from an already-running database, add a separate backfill
  migration before enabling new constraints as `NOT NULL`.
