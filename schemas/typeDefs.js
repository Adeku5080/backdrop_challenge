const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    name:String
    email:String
    is_verified:Boolean
    token:String
  }

  type Account {
    user_account_number:String
    user_bank_code:String
    user_account_name:String
  }

  #queries
  type Query{
    getAccount(user_bank_code:String ,user_account_number:String):Account
  }

  input UserInput{
    name:String,
    email:String
  }

  input AccountInput{
    user_account_number:String
    user_bank_code:String
    user_account_name:String
  }

  #mutation
  type Mutation{
    createUser(user:UserInput): User
    createAccount(account:AccountInput):Account
  }

`;

module.exports = typeDefs;
