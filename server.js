const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const AccountModel = require("./model/Account");
const UserModel = require("./model/User");
const levenshtein = require("fast-levenshtein");
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
const Account = require("./model/Account");

const PORT = 8000;
connect(process.env.MONGO_URI);

const token = "sk_test_7edfc900ca6f0d9d838f40f77b843898dff18e79";

async function resolveAcct(account_no, bank_code) {
  const { data } = await axios.get(
    `https://api.paystack.co/bank/resolve?account_number=${account_no}&bank_code=${bank_code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

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

const AccountType = new graphql.GraphQLObjectType({
  name: "Account",
  fields: () => ({
    user_account_number: { type: GraphQLInt },
    user_bank_code: { type: GraphQLString },
    user_account_name: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      args: {},
      resolve(parents, args) {
        return userData;
      },
    },

    getAccountName: {
      type: new GraphQLList(AccountType),
      args: {
        user_bank_code: { type: GraphQLString },
        user_account_number: { type: GraphQLInt },
      },
      async resolve(parents, args) {
        const account = await AccountModel.findOne({
          user_bank_code: args.user_bank_code,
          user_account_number: args.user_account_number,
        });
       console.log(account);
      },
    },
  },
});

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
        const user = UserModel.create();
      },
    },
    createAccount: {
      type: AccountType,
      args: {
        user_account_number: { type: GraphQLInt },
        user_bank_code: { type: GraphQLString },
        user_account_name: { type: GraphQLString },
      },
      async resolve(parents, args) {
        const { data: resolvedAcct } = await resolveAcct(
          args.user_account_number,
          args.user_bank_code
        );

        const distance = levenshtein.get(
          args.user_account_name.toLowerCase(),
          resolvedAcct.account_name.toLowerCase()
        );
        console.log(distance, "LD");
        if (distance <= 2) {
          try {
            const account = await AccountModel.create({
              user_account_number: args.user_account_number,
              user_bank_code: args.user_bank_code,
              user_account_name: args.user_account_name,
            });
          } catch (err) {
            console.log(err);
          }
        }
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
