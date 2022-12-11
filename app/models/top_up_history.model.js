const mongoose = require("mongoose");

const TopUpHistory = mongoose.model(
  "Top Up History",
  new mongoose.Schema({
    transaction_code: Number,
    user_id: { type: mongoose.Types.ObjectId, ref: "User" },
    payment_method: Number,
    top_up_nominal: Number,
    status: Boolean,
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

module.exports = TopUpHistory;
