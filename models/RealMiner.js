import { model, Schema } from "mongoose";

const RealMinerSchema = new Schema(
  {
    minerId: {
      type: String,
      required: true,
      unique: true,
    },
    minerName: {
      type: String,
    },
    f2PoolId: {
      type: String,
      required: true,
    },
    minerImageUrl: {
      type: String,
    },
    minerImagePublicId: {
      type: String,
    },
    totalHashRate: {
      type: Number,
      required: true,
    },
    h1_hash_rate: {
      type: Number,
      default: 0,
    },
    h24_hash_rate: {
      type: Number,
      default: 0,
    },
    hashRate_history: {
      type: [Object],
    },
    allocatedHashRate: {
      type: Number,
      default: 0,
    },
    availableHashRate: {
      type: Number,
      default: function () {
        return this.totalHashRate - this.allocatedHashRate;
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  { timestamps: true }
);

const RealMiner = model("RealMiner", RealMinerSchema);
export default RealMiner;
