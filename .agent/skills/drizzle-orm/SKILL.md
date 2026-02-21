---
name: drizzle-orm
description: |
  Best practices for using Drizzle ORM in Deno projects.
  Use when: writing database schema, running migrations, or querying the Postgres database.
license: MIT
metadata:
  version: 1.0.0
  author: Agent
  category: Database
  framework: Drizzle
---

# Drizzle ORM for Deno

## Core Principles

1. **Drizzle uses the Postgres.js driver.** When connecting `drizzle-orm` in Deno, use
   `drizzle-orm/postgres-js` and the `postgres` driver from deno.land.
2. **Type Safety:** Always define tables in a central `schema.ts`. Export the `InferSelectModel` and
   `InferInsertModel` types.
3. **No Raw SQL:** Use the Drizzle query builder (`db.select()`, `db.insert()`) to avoid SQL
   injection and maintain type safety.

## Deno Setup Example

**1. Connection (`db.ts`)**

```typescript
import { drizzle } from 'npm:drizzle-orm/postgres-js';
import postgres from 'https://deno.land/x/postgresjs/mod.js';
import * as schema from './schema.ts';

const queryClient = postgres(Deno.env.get('DATABASE_URL')!);
export const db = drizzle(queryClient, { schema });
```

**2. Schema (`schema.ts`)**

```typescript
import { pgTable, serial, text, varchar } from 'npm:drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 256 }).notNull().unique(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Migrations in Deno

You can run migrations programmatically at startup using `drizzle-orm/postgres-js/migrator`:

```typescript
import { migrate } from 'npm:drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './db.ts';

await migrate(db, { migrationsFolder: './drizzle' });
await queryClient.end();
```
