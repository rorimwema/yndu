// Centralized dependency management for Yndu
// Follows Deno best practices with URL imports

// Standard library
export { assert, assertEquals, assertRejects } from 'std/assert/mod.ts';

export { beforeEach, describe, it } from 'std/testing/bdd.ts';

export { serve, type ServeInit } from 'std/http/server.ts';

export { load } from 'std/dotenv/mod.ts';

// Database
export { Client as PostgresClient, type ClientOptions as PostgresOptions } from 'postgres';

export { default as Knex, type Knex as KnexType } from 'npm:knex@3.1.0';
export { default as pg } from 'npm:pg@8.11.3';

// Redis
export { connect as connectRedis } from 'redis';

// Validation
export { z } from 'zod';

// Web framework
export {
  Application as OakApp,
  Context,
  Context as OakContext,
  type Middleware,
  type Next,
  Router,
} from 'oak';

export { oakCors } from 'cors';

// Utilities
export { v1 as uuidv1, v4 as uuidv4, validate as validateUuid } from 'uuid';

// GraphQL
export { gql } from 'graphql';
export {
  buildSchema,
  type DocumentNode,
  type ExecutionResult,
  graphql,
  parse,
  visit,
} from 'npm:graphql@16.9.0';
