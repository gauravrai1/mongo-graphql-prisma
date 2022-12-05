import { typeDefs } from './types/typeDefs';
import { resolvers } from './resolvers/index';
import { createServer } from 'http'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import { WebSocketServer } from 'ws'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
const express = require('express')
import { useServer } from 'graphql-ws/lib/use/ws'
import { context } from './context'

const schema = makeExecutableSchema({ typeDefs, resolvers })

const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json())
const httpServer = createServer(app)

async function start() {
  /** Create WS Server */
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  /** hand-in created schema and have the WS Server start listening */
  const serverCleanup = useServer(
    {
      schema,
      context: context,
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({req, ...context}),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()
  server.applyMiddleware({ app })

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
    console.log(`⏰ Subscriptions ready at http://localhost:4000/graphql`)
    console.log(
      `⭐️ See sample queries: http://pris.ly/e/ts/graphql-subscriptions#using-the-graphql-api`,
    )
  })
}

start()