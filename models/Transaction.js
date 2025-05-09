import { model, Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    transactions: {
      type: [Object],
    },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", TransactionSchema);
export default Transaction;
