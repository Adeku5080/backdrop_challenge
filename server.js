const express = require("express");
const app = express();
const graphql = require("graphql");
const {GraphQLObjectType,GraphQLSchema,GraphQLInt,GraphQLString,GraphQLList}=graphql
const { graphqlHTTP } = require("express-graphql");

const PORT = 8000;

const UserType = new GraphQLObjectType({
    name : "User",
    fields : ()=>({
        id : {type:GraphQLInt},
        firstName : {type:GraphQLString},
        lastName : {type:GraphQLString},
        email : {type:GraphQLString},
         Password:{type:GraphQLString}


    })
})
const RootQuery = new GraphQLObjectType({
    name : "RooTQueryType",
    field :{
       getAllUsers:{
        type:new GraphQLList(UserType),
        args:{id:{type:GraphQLInt}},
        resolve(parents,arg){
            return userData
        }
       } 
    }
})
const Mutation = new GraphQLObjectType({
    new : "Mutation",
    fields :{
        createUser:{
            type:UserType,
            args:{
                firstName :{type:GraphQLString},
                LastName :{type:GraphQLString},
               Email :{type:GraphQLString},
                Password :{type:GraphQLString}
            },
            resolve(parents,args){
             return
            }
        }
    }
})

const schema = new GraphQLSchema({query: RootQuery, mutation:Mutation })

app.use('/graphql',graphqlHTTP({
    schema,
    graphiql:true
}) )

app.listen(PORT, () => {
  console.log(`you are listening on port ${PORT}`);
});
