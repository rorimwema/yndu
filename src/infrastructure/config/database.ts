// Database configuration and connection
import { PostgresClient, type PostgresOptions } from "../deps.ts";
import { load } from "std/dotenv/mod.ts";

const env = await load();

const dbConfig: PostgresOptions = {
  hostname: env.DATABASE_HOST || "localhost",
  port: parseInt(env.DATABASE_PORT || "5432"),
  user: env.DATABASE_USER || "postgres",
  password: env.DATABASE_PASSWORD || "pass",
  database: env.DATABASE_NAME || "yndu",
};

export const dbClient = new PostgresClient(dbConfig);

export async function connectDatabase() {
  try {
    await dbClient.connect();
    console.log("✅ Database connected");
    return dbClient;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await dbClient.end();
  console.log("✅ Database disconnected");
}
