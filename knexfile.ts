import type { Knex } from 'knex';
import process from 'node:process';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'pass',
      database: 'yndu',
    },
    migrations: {
      directory: './src/infrastructure/adapters/postgres/migrations',
    },
    seeds: {
      directory: './src/infrastructure/adapters/postgres/seeds',
    },
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/infrastructure/adapters/postgres/migrations',
    },
  },
};

export default config;
