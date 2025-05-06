import { BadRequestError, NotFoundError } from "../errors/customErrors";
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
  user.balance -= amount;
  await Promise.all([withdrawal.save(), user.save()]);
  res.status(201).json({ success: true, withdrawal });
};

export const getWithdrawHistory = async (req, res) => {
  const withdraws = await Withdrawal.find({ userId: req.user.userId }).sort({
    requestDate: -1,
  });
  if (!withdraws) throw new NotFoundError("No records found");
  res.status(200).json({ success: true, withdraws });
};

export const processWithdrawal = async (req, res) => {
  const { withdrawalId, status, transactionHash } = req.body;
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) throw new NotFoundError("No withdrawal records found");
  withdrawal.status = status;
  if (transactionHash) withdrawal.transactionHash = transactionHash;
  if (status === "completed") withdrawal.completionDate = Date.now();
  await withdrawal.save();
  res.status(200).json({ success: true, withdrawal });
};
