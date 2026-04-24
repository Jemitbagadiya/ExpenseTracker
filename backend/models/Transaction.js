const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user_id: String,
    amount: Number,
    type: String, // income or expense
    category: String,
    note: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);