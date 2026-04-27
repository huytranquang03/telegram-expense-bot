const mongoose = require("mongoose");
const expenseSchema = require("./Expense");

const sessionSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  activeMode: { type: String, enum: ["quick", "detailed"], default: "quick" },
  members_quick: [{ type: String }],
  members_detailed: [{ type: String }],
  expenses_quick: [expenseSchema],
  expenses_detailed: [expenseSchema],
  pendingBill: {
    payer: String,
    totalPaid: Number,
    items: [{
      description: String,
      amount: Number,
      participants: [String]
    }]
  }
});


module.exports = mongoose.model("Session", sessionSchema);
