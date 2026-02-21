import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres-js';
import { getEnv } from '../../config/secret-env.ts';

const databaseUrl = `postgres://${getEnv('DATABASE_USER', 'postgres')}:${
  getEnv('DATABASE_PASSWORD', 'pass')
}@${getEnv('DATABASE_HOST', 'localhost')}:${getEnv('DATABASE_PORT', '5432')}/${
  getEnv('DATABASE_NAME', 'yndu')
}`;

export async function runMigrations() {
  console.log('⏳ Running database migrations...');
  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, {
      migrationsFolder: './src/infrastructure/adapters/postgres/drizzle-migrations',
    });
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

// Allow running directly
if (import.meta.main) {
  await runMigrations();
  Deno.exit(0);
}
