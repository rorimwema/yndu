import { Buffer } from 'node:buffer';
import process from 'node:process';
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

function decodeJwtSub(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload?.sub === 'string' ? payload.sub : null;
  } catch (_error) {
    return null;
  }
}

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    if (context.authHeader) {
      request.http.headers.set('authorization', context.authHeader);
    }
    if (context.userId) {
      request.http.headers.set('x-user-id', context.userId);
    }
  }
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: process.env.USER_SERVICE_URL || 'http://localhost:4001/graphql' },
      {
        name: 'inventory',
        url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002/graphql',
      },
      { name: 'orders', url: process.env.ORDER_SERVICE_URL || 'http://localhost:4003/graphql' },
    ],
  }),
  buildService({ url }) {
    return new AuthenticatedDataSource({ url });
  },
});

const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ req }) => {
    const authHeader = req.headers.authorization || null;
    const forwardedUserId = req.headers['x-user-id'] || null;
    return {
      authHeader,
      userId: forwardedUserId || decodeJwtSub(authHeader),
    };
  },
}).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
