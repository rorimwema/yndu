// Centralized dependency management for Yndu
// Follows Deno best practices with URL imports

// Standard library
export {
  assert,
  assertEquals,
  assertRejects,
} from "std/assert/mod.ts";

export { describe, it, beforeEach } from "std/testing/bdd.ts";

export {
  serve,
  type ServeInit,
} from "std/http/server.ts";

export { load } from "std/dotenv/mod.ts";

// Database
export {
  Client as PostgresClient,
  type ClientOptions as PostgresOptions,
} from "postgres";

// Redis
export { connect as connectRedis } from "redis";

// Validation
export { z } from "zod";

// Web framework
export {
  Application as OakApp,
  Router as OakRouter,
  Context as OakContext,
  type Middleware,
} from "oak";

export { oakCors } from "cors";

// Utilities
export {
  v1 as uuidv1,
  v4 as uuidv4,
  validate as validateUuid,
} from "uuid";

// GraphQL
export { gql } from "graphql";
