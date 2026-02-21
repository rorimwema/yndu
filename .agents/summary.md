# Drizzle ORM Implementation Plan

Based on the instructions to avoid complexity and use the simplest approach, here is the plan to
introduce Drizzle ORM into the Yndu Deno backend.

## 1. Goal

Move away from raw SQL schemas and Knex to Drizzle ORM for type-safe database access and automated
migrations on the VPS, without breaking the existing Knex repositories instantly.

## 2. Approach (The Simplest Possible Way)

Instead of a gigantic, risky refactor rewriting thousands of lines of Knex queries and SQL files on
day one, we will use the **Strangler Fig Pattern**:

- **Coexist:** Both Knex and Drizzle will sit side-by-side initially.
- **Setup Drizzle:** Add `drizzle-orm`, `drizzle-kit`, and `postgres` to `deno.json`.
- **Create Drizzle Config:** Set up `drizzle.config.ts` and a database connection in
  `src/infrastructure/config/drizzle.ts`.
- **Introspect (Pull):** Instead of manually typing out all the existing schemas from
  `001_initial_schema.sql` and `004_enterprise_schema.sql`, we will use `drizzle-kit pull` (or
  manually map a couple of essential tables like `users`) to instantly generate the TypeScript
  schema from the running local database.
- **Migration Script:** Create a safe `src/infrastructure/adapters/postgres/migrate.ts` script that
  Deno can run when booting to handle future table modifications.

## 3. Immediate Action Items

1. Add Drizzle skill to `.agent/skills/drizzle-orm/SKILL.md`.
2. Update `deno.json` with Drizzle dependencies.
3. Add `src/infrastructure/config/drizzle.ts` next to `database.ts`.
4. Create a baseline `src/infrastructure/adapters/postgres/schema.ts` defining the core tables
   (e.g., `users`, `orders`) so new features can be built with Drizzle immediately.
