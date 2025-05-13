import mongoose, { model, Schema } from "mongoose";

const RewardSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    virtualMinerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualMiner",
    },
    realMinerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RealMiner",
    },
    reward_from: {
      type: String,
      enum: ["pool", "real-miner", "virtual-miner"],
    },
    reward_to: {
      type: String,
      enum: ["pool", "real-miner", "virtual-miner"],
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

const Reward = model("Reward", RewardSchema);
export default Reward;
