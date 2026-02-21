import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres-js';
import * as schema from '../adapters/postgres/schema.ts';
import { getEnv } from './secret-env.ts';

const databaseUrl = `postgres://${getEnv('DATABASE_USER', 'postgres')}:${
  getEnv('DATABASE_PASSWORD', 'pass')
}@${getEnv('DATABASE_HOST', 'localhost')}:${getEnv('DATABASE_PORT', '5432')}/${
  getEnv('DATABASE_NAME', 'yndu')
}`;

const queryClient = postgres(databaseUrl, { max: 5 });
export const drizzleDb = drizzle(queryClient, { schema });
