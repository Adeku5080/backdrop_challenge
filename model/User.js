
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name :{
      type:String
    },

    email :{
      type:String
    },
    is_verified :{
        type:Boolean,
        default:false,
    }
})