const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: process.env.USER_SERVICE_URL || 'http://localhost:4001/graphql' },
      { name: 'inventory', url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:4002/graphql' },
      { name: 'orders', url: process.env.ORDER_SERVICE_URL || 'http://localhost:4003/graphql' },
    ],
  }),
});

const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
