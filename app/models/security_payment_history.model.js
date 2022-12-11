const mongoose = require("mongoose");

const SecurityPaymentHistory = mongoose.model(
  "Security Payment History",
  new mongoose.Schema({
    transaction_code: Number,
    user_id: { type: mongoose.Types.ObjectId, ref: "User" },
    period: Number,
    nominal: Number,
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

module.exports = SecurityPaymentHistory;
