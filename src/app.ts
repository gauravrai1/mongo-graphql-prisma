import { ApolloServer } from 'apollo-server'
import { typeDefs } from './types/typeDefs';
import { resolvers } from './resolvers/index';
import { context } from './context'

new ApolloServer({ resolvers, typeDefs, context: context }).listen(
  { port: 4000 },
  () =>
    console.log(`
🚀 Server ready at: http://localhost:4000
⭐️ See sample queries: http://pris.ly/e/ts/graphql-sdl-first#using-the-graphql-api`),
)