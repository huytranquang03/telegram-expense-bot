const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  payer: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: "Đóng góp quỹ chung" },
  participants: [{ type: String }],
  isSplitAll: { type: Boolean, default: true },
  customAmounts: [{
    name: String,
    amount: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = expenseSchema;
