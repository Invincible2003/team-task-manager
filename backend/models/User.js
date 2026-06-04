const mongoose = require("mongoose");
const { createModelWrapper } = require("./dbWrapper");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  }
});

const UserModel = mongoose.model("User", userSchema);
module.exports = createModelWrapper("User", UserModel);