const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./schemas/typeDefs");
const resolvers = require("./schemas/resolvers");
const connect = require("./database/connect");
require("dotenv").config();

const app = express();
connect(process.env.MONGO_URI);

async function startServer() {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context:({req})=>({req})
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app: app });

  app.listen(4000, () => {
    console.log("server is running on port 4000");
  });
}

startServer();
