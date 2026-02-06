// Environment configuration
import { load } from "std/dotenv/mod.ts";

const env = await load();

export const config = {
  // Server
  port: parseInt(env.PORT || "8000"),
  host: env.HOST || "0.0.0.0",
  env: env.NODE_ENV || "development",

  // Database
  database: {
    host: env.DATABASE_HOST || "localhost",
    port: parseInt(env.DATABASE_PORT || "5432"),
    user: env.DATABASE_USER || "postgres",
    password: env.DATABASE_PASSWORD || "pass",
    name: env.DATABASE_NAME || "yndu",
  },

  // Redis
  redis: {
    host: env.REDIS_HOST || "localhost",
    port: parseInt(env.REDIS_PORT || "6379"),
  },

  // Security
  cors: {
    origin: env.CORS_ORIGIN || "*",
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: env.JWT_EXPIRES_IN || "24h",
  },
} as const;
