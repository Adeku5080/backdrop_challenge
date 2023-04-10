const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  user_account_number: {
    type: Number,
  },
  user_bank_code: {
    type: String,
  },
  user_account_name: {
    type: String,
  },
});

module.exports = mongoose.model("Account",AccountSchema);
