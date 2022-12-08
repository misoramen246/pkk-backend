const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    created_by: { type: mongoose.Types.ObjectId, ref: "User" },
    created_on: Number,
    deleted_by: { type: mongoose.Types.ObjectId, ref: "User" },
    deleted_on: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
  })
);

module.exports = User;
