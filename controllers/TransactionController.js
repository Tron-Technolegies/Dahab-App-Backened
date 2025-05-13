import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import F2PoolAPI from "../services/pool.js";
import { f2PoolDate, f2poolEndDate } from "../utils/date.js";
import RealMiner from "../models/RealMiner.js";
import Reward from "../models/Reward.js";
import { NotFoundError } from "../errors/customErrors.js";
import VirtualMiner from "../models/VirtualMiner.js";

const f2pool = new F2PoolAPI();

export const getTransactionData = async (req, res) => {
  const today = new Date();

  const start = f2PoolDate(today.toISOString().slice(0, 10));
  const end = f2poolEndDate(today.toISOString().slice(0, 10));
  const data = await f2pool.getTransactionList(start, end);
  if (data.transactions.length > 0) {
    const transaction = await Transaction.find();
    if (transaction.length > 0) {
      transaction[0].transactionsHistory = [
        ...transaction[0]?.transactionsHistory,
        ...data.transactions,
      ];
      transaction[0].currentTransaction = data.transactions;
      await transaction.save();
    } else {
      const newTransaction = new Transaction({
        transactionsHistory: data.transactions,
        currentTransaction: data.transactions,
      });
      await newTransaction.save();
    }
    res.status(200).json({ success: true, message: "Success", data });
  } else {
    res
      .status(400)
      .json({ success: false, message: "No transactiions has been made" });
  }
};

export const syncTransactions = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const transaction = await Transaction.find().session(session);
    const miners = await RealMiner.find().session(session);
    if (transaction.length === 0)
      throw new NotFoundError("No Transactions found");
    const filteredTransaction = transaction[0].currentTransaction.filter(
      (item) => item.type === "revenue_fpps"
    );
    if (filteredTransaction.length === 0)
      throw new NotFoundError("No revenue Transactions");
    for (const trans of filteredTransaction) {
      const totalHashRate = trans?.mining_extra?.hash_rate;
      if (!totalHashRate || totalHashRate === 0) continue;
      for (const miner of miners) {
        if (!miner.h24_hash_rate || miner.h24_hash_rate === 0) continue;
        const transAmount =
          (miner.h24_hash_rate / totalHashRate) * trans.changed_balance;

        const newReward = {
          type: "revenue_fpps",
          amount: transAmount,
          createdAt: new Date(),
        };

        miner.rewardsHistory.push(newReward);
        miner.totalRewardAmount += transAmount;
        miner.totalRewardBalance += transAmount;

        await miner.save({ session });
        const newRecord = new Reward({
          reward_from: "pool",
          reward_to: "real-miner",
          realMinerId: miner._id,
          amount: transAmount,
        });

        await newRecord.save({ session });
      }
    }
    await session.commitTransaction();
    res
      .status(200)
      .json({ success: true, message: "Successfully splitted rewards" });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(500)
      .json({ success: false, message: "Transaction failed", error: error });
  } finally {
    session.endSession();
  }
};

export const syncVirtualTransactions = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const realMiners = await RealMiner.find().session(session);
    for (const realMiner of realMiners) {
      if (!realMiner.h24_hash_rate || realMiner.h24_hash_rate === 0) continue;
      const pendingRewards = realMiner.rewardsHistory.filter(
        (reward) => reward.status === "pending"
      );
      if (pendingRewards.length === 0) continue;
      const virtualMiners = await VirtualMiner.find({
        realMinerId: realMiner._id,
      }).session(session);
      if (virtualMiners.length === 0) continue;
      for (const reward of pendingRewards) {
        let totalSplit = 0;
        for (const vm of virtualMiners) {
          if (!vm.h24_hash_rate || vm.h24_hash_rate === 0) continue;
          const fraction = vm.h24_hash_rate / realMiner.h24_hash_rate;
          const splitAmount = reward.amount * fraction;

          const vmReward = {
            type: reward.type,
            amount: splitAmount,
            created_date: Date.now(),
          };
          vm.rewardHistory.push(vmReward);
          vm.totalEarned += splitAmount;
          vm.currentBalance += splitAmount;
          vm.lastRewardDate = new Date();
          await vm.save({ session });
          const newRecord = new Reward({
            reward_from: "real-miner",
            reward_to: "virtual-miner",
            realMinerId: realMiner._id,
            virtualMinerId: vm._id,
            amount: splitAmount,
          });

          await newRecord.save({ session });
          totalSplit += splitAmount;
        }
        reward.status = "distributed";
        reward.distributedAmount = totalSplit;
        realMiner.totalRewardBalance -= totalSplit;
        realMiner.distributedRewardAmount += totalSplit;
      }
      await realMiner.save({ session });
    }
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Successfully split rewards to virtual miners.",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Reward splitting failed." });
  } finally {
    session.endSession();
  }
};
