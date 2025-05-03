import mongoose, { model, Schema } from "mongoose";

const WithdrawalSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    transactionHash: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Withdrawal = model("Withdrawal", WithdrawalSchema);
export default Withdrawal;
