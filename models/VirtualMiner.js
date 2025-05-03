import mongoose, { model, Schema } from "mongoose";

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
    totalEarned: {
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
  },
  {
    timestamps: true,
  }
);

const VirtualMiner = model("VirtualMiner", VirtualMinerSchema);
export default VirtualMiner;
