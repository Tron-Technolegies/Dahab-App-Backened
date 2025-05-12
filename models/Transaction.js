import { model, Schema } from "mongoose";

//this model is for syncing with f2pool

const TransactionSchema = new Schema(
  {
    transactionsHistory: {
      type: [Object],
    },
    currentTransaction: {
      type: [Object],
    },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
