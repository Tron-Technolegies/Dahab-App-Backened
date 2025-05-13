import mongoose, { model, Schema } from "mongoose";

const rewardSchema = new Schema(
  {
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    created_date: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "distributed"],
      default: "pending",
    },
    mining_details: {
      type: Object,
    },
    payout_extra: {
      type: Object,
    },
  },
  { timestamps: true }
);

const VirtualMinerSchema = new Schema(
  {
    vmId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    realMinerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RealMiner",
      required: true,
    },
    hashRate: {
      type: Number,
      required: true,
    },
    current_hash_rate: {
      type: Number,
      default: 0,
    },
    h1_hash_rate: {
      type: Number,
      default: 0,
    },
    h24_hash_rate: {
      type: Number,
      default: 0,
    },
    hash_rate_history: {
      type: [Object],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRewardDate: {
      type: Date,
    },
    rewardHistory: {
      type: [rewardSchema],
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    pendingReward: {
      type: Number,
      default: 0,
    },
    minerImageUrl: {
      type: String,
    },
    minerImagePublicId: {
      type: String,
    },
    real_fraction: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const VirtualMiner = model("VirtualMiner", VirtualMinerSchema);
export default VirtualMiner;
