import { model, Schema } from "mongoose";

//this model is for syncing with f2pool
const HistorySchema = new Schema({
  id: {
    type: Number,
  },
  type: {
    type: String,
  },
  changed_balance: {
    type: String,
  },
  created_at: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["pending", "synced"],
  },
  mining_extra: {
    type: Object,
  },
  payout_extra: {
    type: Object,
  },
});

const TransactionSchema = new Schema(
  {
    transactionsHistory: {
      type: [HistorySchema],
    },
    currentTransaction: {
      type: [Object],
    },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
