const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");
const AccountModel = require("./model/Account");
const UserModel = require("./model/User");
const levenshtein = require("fast-levenshtein");
const connect = require("./database/connect");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
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
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

const AccountType = new graphql.GraphQLObjectType({
  name: "Account",
  fields: () => ({
    user_account_number: { type: GraphQLString },
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
        user_account_number: { type: GraphQLString },
      },
      async resolve(parents, args) {
        try {
          const accountName = await AccountModel.find({
            user_bank_code: args.user_bank_code,
            user_account_number: args.user_account_number,
          });

          if (accountName) {
            return accountName;
          }

          if (!accountName) {
            const { data } = await resolveAcct(
              args.user_account_number,
              args.user_bank_code
            );
            console.log(data);

            return data.account_name;
          }
        } catch (err) {
          console.log(err);
        }
      },
    },
  },
});

//mutation
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //create user mutation
    createUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      async resolve(parents, args) {
        const user = await UserModel.create({
          name: args.name,
          email: args.email,
        });

        const tokenUser = {
          name: user.name,
          id: user._id,
        };

        const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_LIFETIME,
        });
        return {
          user,
          token,
        };
      },
    },

    //create account mutation
    createAccount: {
      type: AccountType,
      args: {
        user_account_number: { type: GraphQLString },
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
        if (distance <= 2) {
          try {
            const account = await AccountModel.create({
              user_account_number: args.user_account_number,
              user_bank_code: args.user_bank_code,
              user_account_name: args.user_account_name,
            });
            return account;
          } catch (err) {
            console.log(err);
          }
        }
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

// app.use(authMiddleware);
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
