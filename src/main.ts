// Main entry point for Yndu Deno application
import { load } from "std/dotenv/mod.ts";
import { OakApp, oakCors } from "./deps.ts";
import { createRouter } from "./routes/mod.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { requestLogger } from "./middleware/logger.ts";

// Load environment variables
const env = await load();

// Application configuration
const PORT = parseInt(env.PORT || "8000");
const HOST = env.HOST || "0.0.0.0";

// Create Oak application
const app = new OakApp();

// Middleware
app.use(requestLogger);
app.use(oakCors({
  origin: env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
const router = createRouter();
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling (must be last)
app.use(errorHandler);

// Start server
console.log(`🚀 Yndu server running at http://${HOST}:${PORT}`);
console.log(`📊 Environment: ${env.NODE_ENV || "development"}`);

await app.listen({ hostname: HOST, port: PORT });
