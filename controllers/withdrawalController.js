import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";

export const requestWithdraw = async (req, res) => {
  const { amount, walletAddress } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("No user found");
  if (user.balance < amount) throw new BadRequestError("Insufficient Balance");
  const withdrawal = new Withdrawal({
    userId: req.user.userId,
    amount,
    walletAddress,
    status: "pending",
  });
  // user.balance -= amount;
  await withdrawal.save();
  res.status(201).json({ success: true, withdrawal });
};

export const getAllWithdraws = async (req, res) => {
  const withdraws = await Withdrawal.find();
  if (withdraws.length === 0) throw new NotFoundError("No withdraws found");
  res.status(200).json({ success: true, withdraws });
};

export const getWithdrawHistory = async (req, res) => {
  const withdraws = await Withdrawal.find({ userId: req.user.userId }).sort({
    requestDate: -1,
  });
  if (!withdraws) throw new NotFoundError("No records found");
  res.status(200).json({ success: true, withdraws });
};

export const processWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { withdrawalId, status } = req.body;
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new NotFoundError("No withdrawal records found");
    const user = await User.findById(withdrawal.userId).session(session);
    if (!user) throw new NotFoundError("No user found");
    withdrawal.status = status;
    if (status === "completed") {
      if (user.balance < withdrawal.amount) {
        throw new BadRequestError("Insufficient Balance");
      }
      withdrawal.completionDate = new Date();
      user.balance -= withdrawal.amount;
      user.transferred += withdrawal.amount;
    }
    await withdrawal.save({ session });
    await user.save({ session });
    await session.commitTransaction();
    res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
