// Redis configuration
import { connectRedis } from "../deps.ts";
import { load } from "std/dotenv/mod.ts";

const env = await load();

export async function connectRedis() {
  try {
    const redis = await connectRedis({
      hostname: env.REDIS_HOST || "localhost",
      port: parseInt(env.REDIS_PORT || "6379"),
    });
    console.log("✅ Redis connected");
    return redis;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    throw error;
  }
}
