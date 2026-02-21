import type { DocumentNode, OakContext } from '../deps.ts';
import { buildSchema, graphql, parse, visit } from '../deps.ts';
import { type Container, getContainer } from '../infrastructure/container.ts';
import { verifyToken } from '../infrastructure/auth/jwt.ts';
import { config } from '../infrastructure/config/env.ts';
import { AddressId, OrderId, ProduceItemId, UserId } from '../domain/value-objects/branded.ts';
import { Quantity } from '../domain/value-objects/Quantity.ts';
import type { PlaceOrderCommand } from '../application/commands/PlaceOrderCommand.ts';

type GraphQLRequestBody = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

type GraphQLContext = {
  container: Container;
  currentUserId: string | null;
};

const MAX_QUERY_DEPTH = 8;

const schema = buildSchema(`
  type Money {
    amount: Int!
    currency: String!
  }

  type Quantity {
    value: Float!
    unit: String!
  }

  type DeliverySlot {
    date: String!
    slotType: String!
  }

  type User {
    id: ID!
    email: String!
    name: String
    phone: String
    role: String
  }

  type ProduceItem {
    id: ID!
    name: String!
    nameSw: String
    category: String!
    unitPrice: Money!
    availableQuantity: Quantity!
    imageUrl: String
  }

  type OrderItem {
    produceId: ID!
    quantity: Quantity!
    linePrice: Money!
  }

  type Order {
    id: ID!
    userId: ID!
    status: String!
    totalPrice: Money!
    deliverySlot: DeliverySlot!
    items: [OrderItem!]!
    createdAt: String
  }

  type Query {
    health: String!
    me: User
    user(id: ID!): User
    orders(userId: ID, status: String, limit: Int = 20, offset: Int = 0): [Order!]!
    order(id: ID!): Order
    produceItems(category: String): [ProduceItem!]!
    produceItem(id: ID!): ProduceItem
  }

  input OrderItemInput {
    produceId: ID!
    quantity: Float!
    unit: String!
  }

  input PlaceOrderInput {
    userId: ID
    items: [OrderItemInput!]!
    deliveryAddressId: ID!
    preferredDeliveryDate: String!
    isSubscription: Boolean!
    subscriptionFrequency: String
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): Order!
    confirmOrder(orderId: ID!): Order!
    cancelOrder(orderId: ID!, reason: String!): Order!
  }
`);

function toMoney(money: { toDTO: () => { amount: number; currency: string } }) {
  return money.toDTO();
}

function toQuantity(quantity: { value: number; unit: string }) {
  return {
    value: quantity.value,
    unit: quantity.unit,
  };
}

function toOrder(order: {
  id: string;
  userId: string;
  status: string;
  totalPrice: { toDTO: () => { amount: number; currency: string } };
  deliverySlot: { date: Date; type: string };
  items: Array<{
    produceId: string;
    quantity: { value: number; unit: string };
    linePrice: { toDTO: () => { amount: number; currency: string } };
  }>;
  placedAt?: Date;
}) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalPrice: toMoney(order.totalPrice),
    deliverySlot: {
      date: order.deliverySlot.date.toISOString(),
      slotType: order.deliverySlot.type,
    },
    items: order.items.map((item) => ({
      produceId: item.produceId,
      quantity: toQuantity(item.quantity),
      linePrice: toMoney(item.linePrice),
    })),
    createdAt: order.placedAt?.toISOString() ?? null,
  };
}

function toProduceItem(item: {
  id: string;
  name: string;
  nameSw?: string;
  category: string;
  unitPrice: { toDTO: () => { amount: number; currency: string } };
  availableQuantity: { value: number; unit: string };
  imageUrl?: string;
}) {
  return {
    id: item.id,
    name: item.name,
    nameSw: item.nameSw ?? null,
    category: item.category,
    unitPrice: toMoney(item.unitPrice),
    availableQuantity: toQuantity(item.availableQuantity),
    imageUrl: item.imageUrl ?? null,
  };
}

function toUser(
  user: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role?: string;
  } | null,
) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    phone: user.phone ?? null,
    role: user.role ?? null,
  };
}

function toDomainQuantity(quantity: number, unit: string): Quantity {
  switch (unit) {
    case 'kg':
      return Quantity.kilograms(quantity);
    case 'g':
      return Quantity.grams(quantity);
    case 'pcs':
      return Quantity.pieces(quantity);
    case 'bunches':
      return Quantity.bunches(quantity);
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

function readAuthToken(ctx: OakContext): string | null {
  const authHeader = ctx.request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

async function resolveCurrentUserId(ctx: OakContext): Promise<string | null> {
  const token = readAuthToken(ctx);
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return payload.sub;
  } catch (_error) {
    return null;
  }
}

function shouldBlockIntrospection(document: DocumentNode): boolean {
  let foundIntrospection = false;
  visit(document, {
    Field(node) {
      if (node.name.value.startsWith('__')) {
        foundIntrospection = true;
      }
    },
  });
  return foundIntrospection;
}

function computeSelectionDepth(
  document: DocumentNode,
  operationName?: string,
): number {
  const fragments = new Map<string, Record<string, unknown>>();
  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragments.set(definition.name.value, definition);
    }
  }

  const selectionDepth = (
    selectionSet: Record<string, unknown> & { selections: Array<Record<string, unknown>> },
    depth: number,
    visitedFragments: Set<string>,
  ): number => {
    let max = depth;
    for (const selection of selectionSet.selections) {
      if (selection.kind === 'Field' && selection.selectionSet) {
        max = Math.max(
          max,
          selectionDepth(selection.selectionSet, depth + 1, visitedFragments),
        );
      } else if (selection.kind === 'InlineFragment') {
        max = Math.max(
          max,
          selectionDepth(selection.selectionSet, depth + 1, visitedFragments),
        );
      } else if (selection.kind === 'FragmentSpread') {
        const name = selection.name.value;
        if (visitedFragments.has(name)) continue;
        const fragment = fragments.get(name);
        if (!fragment) continue;
        const nextVisited = new Set(visitedFragments);
        nextVisited.add(name);
        max = Math.max(
          max,
          selectionDepth(fragment.selectionSet, depth + 1, nextVisited),
        );
      }
    }
    return max;
  };

  let maxDepth = 0;
  for (const definition of document.definitions) {
    if (definition.kind !== 'OperationDefinition') continue;
    if (operationName && definition.name?.value !== operationName) continue;
    maxDepth = Math.max(
      maxDepth,
      selectionDepth(definition.selectionSet, 1, new Set<string>()),
    );
  }

  return maxDepth;
}

function enforceGraphQLPolicy(
  document: DocumentNode,
  operationName?: string,
): void {
  const depth = computeSelectionDepth(document, operationName);
  if (depth > MAX_QUERY_DEPTH) {
    throw new Error(
      `GraphQL query depth ${depth} exceeds max depth ${MAX_QUERY_DEPTH}`,
    );
  }

  if (config.env === 'production' && shouldBlockIntrospection(document)) {
    throw new Error('GraphQL introspection is disabled in production');
  }
}

const root = {
  health: () => 'ok',

  me: async (
    _args: Record<string, unknown>,
    context: GraphQLContext,
  ) => {
    if (!context.currentUserId) return null;
    const user = await context.container.userRepository.findById(
      UserId(context.currentUserId),
    );
    return toUser(user);
  },

  user: async (
    args: { id: string },
    context: GraphQLContext,
  ) => {
    const user = await context.container.userRepository.findById(UserId(args.id));
    return toUser(user);
  },

  orders: async (
    args: { userId?: string; status?: string; limit?: number; offset?: number },
    context: GraphQLContext,
  ) => {
    const resolvedUserId = args.userId ?? context.currentUserId;
    if (!resolvedUserId) {
      throw new Error('orders requires userId or authenticated user context');
    }

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    const offset = Math.max(args.offset ?? 0, 0);

    const orders = await context.container.orderRepository.findByUserId(resolvedUserId);
    const filtered = args.status ? orders.filter((order) => order.status === args.status) : orders;
    return filtered.slice(offset, offset + limit).map((order) =>
      toOrder(
        order as {
          id: string;
          userId: string;
          status: string;
          totalPrice: { toDTO: () => { amount: number; currency: string } };
          deliverySlot: { date: Date; type: string };
          items: Array<
            {
              produceId: string;
              quantity: { value: number; unit: string };
              linePrice: { toDTO: () => { amount: number; currency: string } };
            }
          >;
          placedAt?: Date;
        },
      )
    );
  },

  order: async (
    args: { id: string },
    context: GraphQLContext,
  ) => {
    const order = await context.container.orderRepository.findById(OrderId(args.id));
    if (!order) return null;
    return toOrder(
      order as {
        id: string;
        userId: string;
        status: string;
        totalPrice: { toDTO: () => { amount: number; currency: string } };
        deliverySlot: { date: Date; type: string };
        items: Array<
          {
            produceId: string;
            quantity: { value: number; unit: string };
            linePrice: { toDTO: () => { amount: number; currency: string } };
          }
        >;
        placedAt?: Date;
      },
    );
  },

  produceItems: async (
    args: { category?: string },
    context: GraphQLContext,
  ) => {
    const items = args.category
      ? await context.container.inventoryRepository.findByCategory(args.category)
      : await context.container.inventoryRepository.findAll();
    return items.map((item) =>
      toProduceItem(
        item as {
          id: string;
          name: string;
          nameSw?: string;
          category: string;
          unitPrice: { toDTO: () => { amount: number; currency: string } };
          availableQuantity: { value: number; unit: string };
          imageUrl?: string;
        },
      )
    );
  },

  produceItem: async (
    args: { id: string },
    context: GraphQLContext,
  ) => {
    const item = await context.container.inventoryRepository.findById(
      ProduceItemId(args.id),
    );
    if (!item) return null;
    return toProduceItem(
      item as {
        id: string;
        name: string;
        nameSw?: string;
        category: string;
        unitPrice: { toDTO: () => { amount: number; currency: string } };
        availableQuantity: { value: number; unit: string };
        imageUrl?: string;
      },
    );
  },

  placeOrder: async (
    args: {
      input: {
        userId?: string;
        items: Array<{ produceId: string; quantity: number; unit: string }>;
        deliveryAddressId: string;
        preferredDeliveryDate: string;
        isSubscription: boolean;
        subscriptionFrequency?: string;
      };
    },
    context: GraphQLContext,
  ) => {
    const input = args.input;
    const resolvedUserId = input.userId ?? context.currentUserId;
    if (!resolvedUserId) {
      throw new Error('placeOrder requires input.userId or authenticated user context');
    }

    const preferredDeliveryDate = new Date(input.preferredDeliveryDate);
    if (Number.isNaN(preferredDeliveryDate.getTime())) {
      throw new Error('preferredDeliveryDate must be a valid ISO date');
    }

    const commandBase = {
      userId: UserId(resolvedUserId),
      items: input.items.map((item) => ({
        produceId: ProduceItemId(item.produceId),
        quantity: toDomainQuantity(item.quantity, item.unit),
      })),
      deliveryAddressId: AddressId(input.deliveryAddressId),
      preferredDeliveryDate,
      isSubscription: input.isSubscription,
    };

    const command: PlaceOrderCommand = input.subscriptionFrequency
      ? {
        ...commandBase,
        subscriptionFrequency: input.subscriptionFrequency as
          | 'WEEKLY'
          | 'BIWEEKLY'
          | 'MONTHLY',
      }
      : commandBase;

    const result = await context.container.placeOrderHandler.execute(command);
    if (result.isFailure()) {
      throw new Error(result.getError().message);
    }

    return toOrder(
      result.getValue() as {
        id: string;
        userId: string;
        status: string;
        totalPrice: { toDTO: () => { amount: number; currency: string } };
        deliverySlot: { date: Date; type: string };
        items: Array<
          {
            produceId: string;
            quantity: { value: number; unit: string };
            linePrice: { toDTO: () => { amount: number; currency: string } };
          }
        >;
        placedAt?: Date;
      },
    );
  },

  confirmOrder: async (
    args: { orderId: string },
    context: GraphQLContext,
  ) => {
    const order = await context.container.orderRepository.findById(
      OrderId(args.orderId),
    );
    if (!order) throw new Error('Order not found');

    order.confirm(context.currentUserId ?? 'graphql');
    const events = order.getUncommittedEvents();
    await context.container.orderRepository.save(order);
    await context.container.eventBus.publishAll(events);
    return toOrder(
      order as {
        id: string;
        userId: string;
        status: string;
        totalPrice: { toDTO: () => { amount: number; currency: string } };
        deliverySlot: { date: Date; type: string };
        items: Array<
          {
            produceId: string;
            quantity: { value: number; unit: string };
            linePrice: { toDTO: () => { amount: number; currency: string } };
          }
        >;
        placedAt?: Date;
      },
    );
  },

  cancelOrder: async (
    args: { orderId: string; reason: string },
    context: GraphQLContext,
  ) => {
    const order = await context.container.orderRepository.findById(
      OrderId(args.orderId),
    );
    if (!order) throw new Error('Order not found');

    order.cancel(args.reason, context.currentUserId ?? 'graphql');
    const events = order.getUncommittedEvents();
    await context.container.orderRepository.save(order);
    await context.container.eventBus.publishAll(events);
    return toOrder(
      order as {
        id: string;
        userId: string;
        status: string;
        totalPrice: { toDTO: () => { amount: number; currency: string } };
        deliverySlot: { date: Date; type: string };
        items: Array<
          {
            produceId: string;
            quantity: { value: number; unit: string };
            linePrice: { toDTO: () => { amount: number; currency: string } };
          }
        >;
        placedAt?: Date;
      },
    );
  },
};

export async function handleGraphQL(ctx: OakContext): Promise<void> {
  let body: GraphQLRequestBody;
  try {
    body = await ctx.request.body.json();
  } catch (_error) {
    ctx.response.status = 400;
    ctx.response.body = {
      errors: [{ message: 'Invalid JSON body' }],
    };
    return;
  }

  const query = typeof body.query === 'string' ? body.query : null;
  if (!query) {
    ctx.response.status = 400;
    ctx.response.body = {
      errors: [{ message: 'GraphQL query is required' }],
    };
    return;
  }

  const operationName = typeof body.operationName === 'string' ? body.operationName : undefined;

  let document: DocumentNode;
  try {
    document = parse(query);
    enforceGraphQLPolicy(document, operationName);
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = {
      errors: [{ message: error instanceof Error ? error.message : 'Invalid GraphQL query' }],
    };
    return;
  }

  const context: GraphQLContext = {
    container: getContainer(),
    currentUserId: await resolveCurrentUserId(ctx),
  };

  const result = await graphql({
    schema,
    source: query,
    rootValue: root,
    variableValues: body.variables,
    operationName,
    contextValue: context,
  });

  ctx.response.status = result.errors?.length ? 400 : 200;
  ctx.response.headers.set('Content-Type', 'application/json');
  ctx.response.body = result;
}
