// Database configuration and connection using Knex
import { Knex } from '../../deps.ts';
import { getEnv } from './secret-env.ts';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: getEnv('DATABASE_HOST', 'localhost'),
    port: parseInt(getEnv('DATABASE_PORT', '5432')),
    user: getEnv('DATABASE_USER', 'postgres'),
    password: getEnv('DATABASE_PASSWORD', 'pass'),
    database: getEnv('DATABASE_NAME', 'yndu'),
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export const db: Knex = Knex(knexConfig);

export type Database = Knex;

export async function connectDatabase() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected');
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await db.destroy();
  console.log('✅ Database disconnected');
}
