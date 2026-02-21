import process from 'node:process';
const fs = require('node:fs');
const path = require('node:path');
const DataLoader = require('dataloader');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { parse, visit } = require('graphql');

const PORT = Number(process.env.PORT || 4001);
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8000';
const MAX_QUERY_DEPTH = Number(process.env.GRAPHQL_MAX_DEPTH || 10);
const MAX_COMPLEXITY = Number(process.env.GRAPHQL_MAX_COMPLEXITY || 250);
const MAX_FIELD_COUNT = Number(process.env.GRAPHQL_MAX_FIELDS || 200);

const typeDefs = parse(
  fs.readFileSync(path.join(__dirname, '..', 'schema.graphql'), 'utf8'),
);

function analyzeQueryComplexity(query) {
  const doc = parse(query);
  let fieldCount = 0;
  let maxDepth = 0;
  let complexity = 0;

  const walk = (selectionSet, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    for (const selection of selectionSet.selections) {
      if (selection.kind === 'Field') {
        fieldCount += 1;
        complexity += depth;
        if (selection.selectionSet) walk(selection.selectionSet, depth + 1);
      } else if (selection.kind === 'InlineFragment') {
        walk(selection.selectionSet, depth + 1);
      }
    }
  };

  visit(doc, {
    OperationDefinition(node) {
      walk(node.selectionSet, 1);
    },
  });

  return { maxDepth, fieldCount, complexity };
}

function createComplexityLimitPlugin() {
  return {
    requestDidStart() {
      return {
        didResolveOperation(requestContext) {
          const source = requestContext.request.query;
          if (!source) return;
          const metrics = analyzeQueryComplexity(source);
          if (metrics.maxDepth > MAX_QUERY_DEPTH) {
            throw new Error(
              `Query depth ${metrics.maxDepth} exceeds limit ${MAX_QUERY_DEPTH}`,
            );
          }
          if (metrics.fieldCount > MAX_FIELD_COUNT) {
            throw new Error(
              `Field count ${metrics.fieldCount} exceeds limit ${MAX_FIELD_COUNT}`,
            );
          }
          if (metrics.complexity > MAX_COMPLEXITY) {
            throw new Error(
              `Query complexity ${metrics.complexity} exceeds limit ${MAX_COMPLEXITY}`,
            );
          }
        },
      };
    },
  };
}

function parseName(name) {
  if (!name || typeof name !== 'string') {
    return { firstName: 'Yndu', lastName: 'Customer' };
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Customer' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function normalizeAddress(address) {
  if (!address || typeof address !== 'object') return null;
  const latitude = Number(address?.coordinates?.latitude ?? -2.6848);
  const longitude = Number(address?.coordinates?.longitude ?? 37.9899);
  return {
    id: address.id || crypto.randomUUID(),
    label: address.label || 'Primary',
    coordinates: { latitude, longitude },
    zone: address.zone || 'KIBWEZI_CENTRAL',
  };
}

async function fetchBackendJson(url, init = {}) {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return await response.json();
  } catch (_error) {
    return null;
  }
}

async function loadUserById(id, authHeader) {
  const data = await fetchBackendJson(`${BACKEND_URL}/api/users/${id}`, {
    headers: authHeader ? { Authorization: authHeader } : {},
  });
  return data?.user || null;
}

function createLoaders(authHeader) {
  return {
    userById: new DataLoader(async (ids) => {
      const rows = await Promise.all(ids.map((id) => loadUserById(id, authHeader)));
      return rows;
    }),
  };
}

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.authHeader) return null;
      const data = await fetchBackendJson(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: context.authHeader },
      });
      return data?.user || null;
    },
    user: (_, { id }, context) => context.loaders.userById.load(id),
  },
  User: {
    __resolveReference: (reference, context) => context.loaders.userById.load(reference.id),
    profile: (user) => {
      const { firstName, lastName } = parseName(user?.name);
      return {
        firstName,
        lastName,
        preferredLanguage: 'en',
      };
    },
    addresses: (user) => {
      if (!Array.isArray(user?.addresses)) return [];
      return user.addresses.map(normalizeAddress).filter(Boolean);
    },
    phone: (user) => user?.phone || '',
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [createComplexityLimitPlugin()],
});

startStandaloneServer(server, {
  listen: { port: PORT },
  context: ({ req }) => {
    const authHeader = req.headers.authorization || null;
    return {
      authHeader,
      loaders: createLoaders(authHeader),
    };
  },
}).then(({ url }) => {
  console.log(`Users subgraph ready at ${url}`);
});
