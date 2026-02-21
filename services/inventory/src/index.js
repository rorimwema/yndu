import process from 'node:process';
const fs = require('node:fs');
const path = require('node:path');
const DataLoader = require('dataloader');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { parse, visit } = require('graphql');

const PORT = Number(process.env.PORT || 4002);
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

function parsePrice(value) {
  if (value && typeof value === 'object') {
    return {
      amount: Number(value.amount || 0),
      currency: value.currency || 'KES',
    };
  }
  return { amount: Number(value || 0), currency: 'KES' };
}

function parseQuantity(value) {
  if (value && typeof value === 'object') {
    return {
      value: Number(value.value || 0),
      unit: value.unit || 'kg',
    };
  }
  return { value: Number(value || 0), unit: 'kg' };
}

function toProduceItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    nameSw: item.nameSw || item.name,
    category: item.category,
    unitPrice: parsePrice(item.unitPrice || item.unit_price || item.unitPriceCents),
    availableQuantity: parseQuantity(item.availableQuantity || item.quantity || 0),
    seasonality: {
      isSeasonal: false,
      seasonStart: null,
      seasonEnd: null,
    },
    imageUrl: item.imageUrl || null,
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

async function fetchProduceById(id) {
  const data = await fetchBackendJson(`${BACKEND_URL}/api/inventory/${id}`);
  return toProduceItem(data?.item || null);
}

function createLoaders() {
  return {
    produceById: new DataLoader(async (ids) => {
      const rows = await Promise.all(ids.map((id) => fetchProduceById(id)));
      return rows;
    }),
  };
}

const resolvers = {
  Query: {
    produceItems: async (_, { category }) => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : '';
      const data = await fetchBackendJson(`${BACKEND_URL}/api/inventory${qs}`);
      const items = Array.isArray(data?.items) ? data.items : [];
      return items.map(toProduceItem).filter(Boolean);
    },
    produceItem: (_, { id }, context) => context.loaders.produceById.load(id),
    boxTemplates: () => [],
    boxTemplate: () => null,
  },
  ProduceItem: {
    __resolveReference: (reference, context) => context.loaders.produceById.load(reference.id),
  },
  BoxTemplate: {
    __resolveReference: (reference) => ({ id: reference.id, items: [] }),
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [createComplexityLimitPlugin()],
});

startStandaloneServer(server, {
  listen: { port: PORT },
  context: () => ({
    loaders: createLoaders(),
  }),
}).then(({ url }) => {
  console.log(`Inventory subgraph ready at ${url}`);
});
