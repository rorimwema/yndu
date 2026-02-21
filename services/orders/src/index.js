import process from 'node:process';
const fs = require('node:fs');
const path = require('node:path');
const DataLoader = require('dataloader');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { parse, visit } = require('graphql');

const PORT = Number(process.env.PORT || 4003);
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8000';
const MAX_QUERY_DEPTH = Number(process.env.GRAPHQL_MAX_DEPTH || 10);
const MAX_COMPLEXITY = Number(process.env.GRAPHQL_MAX_COMPLEXITY || 250);
const MAX_FIELD_COUNT = Number(process.env.GRAPHQL_MAX_FIELDS || 220);

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

function defaultDeliverySlot(slot) {
  const date = slot?.date || new Date().toISOString();
  return {
    date,
    slotType: slot?.slotType || slot?.type || 'NEXT_DAY',
    cutoffTime: new Date(date).toISOString(),
  };
}

function normalizeOrderItem(item, index = 0) {
  const produceId = item?.produceId || item?.produce_id || crypto.randomUUID();
  const quantity = parseQuantity(item?.quantity || { value: 0, unit: 'kg' });
  const linePrice = parsePrice(item?.linePrice || item?.line_price || 0);
  return {
    id: item?.id || `order-item-${index}`,
    boxTemplate: null,
    customSelections: [{
      produceItem: { __typename: 'ProduceItem', id: produceId },
      quantity,
      linePrice,
    }],
    finalPrice: linePrice,
  };
}

function normalizeOrder(order) {
  if (!order) return null;
  const items = Array.isArray(order.items) ? order.items : [];
  return {
    id: order.id,
    user: { __typename: 'User', id: order.userId || order.user_id || order.user?.id || '' },
    items: items.map(normalizeOrderItem),
    totalPrice: parsePrice(order.totalPrice || order.total_price || 0),
    deliverySlot: defaultDeliverySlot(order.deliverySlot || order.delivery_slot),
    status: order.status || 'PENDING',
    placedAt: order.createdAt || order.placedAt || new Date().toISOString(),
    confirmedAt: order.confirmedAt || null,
    userId: order.userId || order.user_id || order.user?.id || '',
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

async function resolveCurrentUserId(authHeader, headerUserId) {
  if (headerUserId) return headerUserId;
  if (!authHeader) return null;
  const me = await fetchBackendJson(`${BACKEND_URL}/api/auth/me`, {
    headers: { authorization: authHeader },
  });
  return me?.user?.id || null;
}

async function fetchOrder(id) {
  const data = await fetchBackendJson(`${BACKEND_URL}/api/orders/${id}`);
  return normalizeOrder(data?.order || null);
}

async function fetchOrders(userId, status) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (status) params.set('status', status);
  const qs = params.toString();
  const data = await fetchBackendJson(`${BACKEND_URL}/api/orders${qs ? `?${qs}` : ''}`);
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  return orders.map(normalizeOrder).filter(Boolean);
}

function createLoaders() {
  return {
    orderById: new DataLoader(async (ids) => {
      const rows = await Promise.all(ids.map((id) => fetchOrder(id)));
      return rows;
    }),
    ordersByUserAndStatus: new DataLoader(async (keys) => {
      const rows = await Promise.all(
        keys.map(({ userId, status }) => fetchOrders(userId || null, status || null)),
      );
      return rows;
    }, {
      cacheKeyFn: (key) => `${key.userId || 'none'}|${key.status || 'ALL'}`,
    }),
  };
}

const resolvers = {
  Query: {
    orders: (_, { userId, status }, context) => {
      const resolvedUserId = userId || context.currentUserId || null;
      return context.loaders.ordersByUserAndStatus.load({
        userId: resolvedUserId,
        status: status || null,
      });
    },
    order: (_, { id }, context) => context.loaders.orderById.load(id),
  },
  Mutation: {
    placeOrder: async (_, { input }, context) => {
      const payload = {
        userId: input.userId || context.currentUserId,
        items: input.items,
        deliveryAddressId: input.deliveryAddressId,
        preferredDeliveryDate: input.preferredDeliveryDate,
        isSubscription: input.isSubscription,
        subscriptionFrequency: input.subscriptionFrequency || null,
      };
      const data = await fetchBackendJson(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(context.authHeader ? { authorization: context.authHeader } : {}),
          ...(context.currentUserId ? { 'x-user-id': context.currentUserId } : {}),
        },
        body: JSON.stringify(payload),
      });
      const created = normalizeOrder(data);
      if (created?.id) context.loaders.orderById.clear(created.id).prime(created.id, created);
      return created;
    },
    confirmOrder: async (_, { orderId }, context) => {
      await fetchBackendJson(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          ...(context.authHeader ? { authorization: context.authHeader } : {}),
          ...(context.currentUserId ? { 'x-user-id': context.currentUserId } : {}),
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      context.loaders.orderById.clear(orderId);
      return context.loaders.orderById.load(orderId);
    },
    cancelOrder: async (_, { orderId, reason }, context) => {
      await fetchBackendJson(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          ...(context.authHeader ? { authorization: context.authHeader } : {}),
          ...(context.currentUserId ? { 'x-user-id': context.currentUserId } : {}),
        },
        body: JSON.stringify({ status: 'CANCELLED', reason }),
      });
      context.loaders.orderById.clear(orderId);
      return context.loaders.orderById.load(orderId);
    },
  },
  User: {
    orders: (user, { status }, context) =>
      context.loaders.ordersByUserAndStatus.load({
        userId: user.id,
        status: status || null,
      }),
  },
  Order: {
    __resolveReference: (reference, context) => context.loaders.orderById.load(reference.id),
    user: (order) => ({ __typename: 'User', id: order.userId || order.user?.id }),
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [createComplexityLimitPlugin()],
});

startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || null;
    const headerUserId = req.headers['x-user-id'] || null;
    const currentUserId = await resolveCurrentUserId(authHeader, headerUserId);
    return {
      authHeader,
      currentUserId,
      loaders: createLoaders(),
    };
  },
}).then(({ url }) => {
  console.log(`Orders subgraph ready at ${url}`);
});
