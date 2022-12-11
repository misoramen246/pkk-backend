const mongoose = require("mongoose");

const UserProfile = mongoose.model(
  "User Profile",
  new mongoose.Schema({
    subscription_code: Number,
    name: String,
    phone_number: String,
    address: String,
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

module.exports = UserProfile;
