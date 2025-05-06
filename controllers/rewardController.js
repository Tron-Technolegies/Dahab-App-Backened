import mongoose from "mongoose";
import Reward from "../models/Reward.js";
import User from "../models/User.js";
import VirtualMiner from "../models/VirtualMiner.js";
import { calculateReward } from "../utils/Reward.js";
import { NotFoundError } from "../errors/customErrors.js";

//this has to do periodically like a cron job
export const distributeRewards = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const activeMiners = await VirtualMiner.find({ isActive: true }).session(
      session
    );
    for (const miner of activeMiners) {
      // Calculate reward based on hash rate and current mining profitability
      // This is a simplified example - need to  integrate with F2Pool API here

      const rewardAmount = calculateReward(miner.hashRate);
      const reward = new Reward({
        userId: miner.userId,
        virtualMinerId: miner._id,
        amount: rewardAmount,
        status: "credited",
      });
      miner.lastRewardDate = Date.now();
      miner.totalEarned += rewardAmount;
      miner.pendingReward += rewardAmount;

      await User.findByIdAndUpdate(
        miner.userId,
        {
          $inc: { balance: rewardAmount, totalEarned: rewardAmount },
        },
        { session }
      );
      await reward.save({ session });
      await miner.save({ session });
    }
    await session.commitTransaction();
    res
      .status(200)
      .json({ success: true, message: "rewards distributed successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to distribute rewards",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const getUserRewards = async (req, res) => {
  const rewards = await Reward.find({ userId: req.user.userId }).populate({
    path: "virtualMinerId",
    select: "vmId hashRate",
  });
  if (!rewards) throw new NotFoundError("No rewards found");
  res.status(200).json({ success: true, rewards });
};

export const collectRewards = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const miners = await VirtualMiner.find({
      userId: req.user.userId,
      pendingReward: { $gt: 0 },
    }).session(session);
    if (miners.length === 0) {
      await session.abortTransaction();
      throw new NotFoundError("No Pending Rewards");
    }
    const totalReward = miners.reduce(
      (sum, miner) => sum + miner.pendingReward,
      0
    );
    const rewardRecords = miners.map((miner) => {
      return {
        userId: req.user.userId,
        virtualMinerId: miner._id,
        amount: miner.pendingReward,
        status: "credited",
      };
    });
    await VirtualMiner.updateMany(
      {
        userId: req.user.userId,
        pendingReward: { $gt: 0 },
      },
      { $set: { pendingReward: 0 } },
      { session }
    );
    await User.findByIdAndUpdate(
      req.user.userId,
      {
        $inc: { balance: totalReward },
      },
      { session }
    );
    await Reward.insertMany(rewardRecords, { session });
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Rewards collected successfully",
      amount: totalReward,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to collect rewards",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
