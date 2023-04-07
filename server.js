const express = require("express");
const app = express();
require("dotenv").config();

const connect = require("./database/connect");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = graphql;
const { graphqlHTTP } = require("express-graphql");

const PORT = 8000;
connect(process.env.MONGO_URI);

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    Password: { type: GraphQLString },
  }),
});

const AccountType = new graphql.GraphQLInputObjectType({
  name: "Account",
  fields: () => ({
    user_account_number: { type: GraphQLInt },
    user_bank_code: { type: GraphQLString },
    user_account_name: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  field: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      args: { id: { type: GraphQLInt } },
      resolve(parents, arg) {
        return userData;
      },
    },
  },
});
//
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        LastName: { type: GraphQLString },
        Email: { type: GraphQLString },
        Password: { type: GraphQLString },
      },
      resolve(parents, args) {
        return;
      },
    },
    createAccount: {
      type: AccountType,
      args: {
        user_account_number: { type: GraphQLInt },
        user_bank_code: { type: GraphQLString },
        user_account_name: { type: GraphQLString },
      },
      resolve(parents, args) {
        return;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`you are listening on port ${PORT}`);
});
