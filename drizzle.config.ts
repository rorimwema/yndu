import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/adapters/postgres/schema.ts',
  out: './src/infrastructure/adapters/postgres/drizzle-migrations',
  dialect: 'postgresql',
} satisfies Config;
