import mongoose from "mongoose";
import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/User.js";
import VirtualMiner from "../models/VirtualMiner.js";

export const getUserInfo = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) throw new NotFoundError("No user found");
  res.status(200).json({ success: true, user });
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("No user found");
  user.email = req.body.email;
  user.username = req.body.username;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "profile updated successfully" });
};

export const syncUserProfile = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await User.findById(req.user.userId).session(session);
    if (!user) throw new NotFoundError("User Not Found");
    const miners = await VirtualMiner.find({ userId: req.user.userId }).session(
      session
    );
    if (miners.length === 0) throw new NotFoundError("No Miners Found");
    for (const miner of miners) {
      const filteredRewards = miner.rewardHistory.filter(
        (item) => item.status === "pending"
      );
      if (filteredRewards.length === 0) continue;
      let total = 0;
      for (const reward of filteredRewards) {
        total += reward.amount;
        reward.status = "calculated";
      }
      user.totalEarned += total;
      user.balance += total;
      await miner.save({ session });
    }
    await user.save({ session });
    await session.commitTransaction();
    res.status(200).json({ success: true, message: "successfully synced" });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ success: false, message: error.message || "failed" });
  } finally {
    await session.endSession();
  }
};
