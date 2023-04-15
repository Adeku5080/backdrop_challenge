const Account = require("../model/Account");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const levenshtein = require("fast-levenshtein");
const axios = require("axios");
const checkAuth = require("../utils/check-auth");
require("dotenv").config();

const token = "sk_test_7edfc900ca6f0d9d838f40f77b843898dff18e79";

//service to resolve an account
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

const resolvers = {
  Query: {
    getAccount: async (parent, args, context, info) => {
      const { user_bank_code, user_account_number } = args;
      const account = await Account.findOne({
        user_bank_code,
        user_account_number,
      });

      if (account) {
        return {
          user_account_name: account.user_account_name,
        };
      }

      if (!account) {
        const { data: resolvedAcct } = await resolveAcct(
          user_account_number,
          user_bank_code
        );
        return {
          user_account_name: resolvedAcct.account_name,
        };
      }
    },
  },

  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { name, email } = args.user;
      const user = await User.create({
        name,
        email,
      });

      const tokenUser = {
        name: user.name,
        id: user._id,
      };

      const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
      });
      return {
        name: user.name,
        email: user.email,
        token,
      };
    },

    createAccount: async (parent, args, context, info) => {
      const user = checkAuth(context);
      const { user_account_number, user_bank_code, user_account_name } =
        args.account;

      const { data: resolvedAcct } = await resolveAcct(
        user_account_number,
        user_bank_code
      );

      const distance = levenshtein.get(
        user_account_name.toLowerCase(),
        resolvedAcct.account_name.toLowerCase()
      );

      if (distance <= 2) {
        const account = await Account.create({
          user_account_number,
          user_bank_code,
          user_account_name,
        });

        const updatedUser = await User.findOneAndUpdate(
          { _id: user.id },
          { is_verified: true },
          {
            new: true,
            runValidators: true,
          }
        );
        console.log(updatedUser, "updated user");

        return {
          user_account_name: account.user_account_name,
        };
      }
    },
  },
};

module.exports = resolvers;
