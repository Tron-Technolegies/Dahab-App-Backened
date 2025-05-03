import mongoose, { Schema } from "mongoose";

const RewardSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    virtualMinerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualMiner",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "credited", "withdrawn"],
      default: "pending",
    },
    transactionHash: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
