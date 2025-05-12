import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import F2PoolAPI from "../services/pool.js";
import { f2PoolDate, f2poolEndDate } from "../utils/date.js";
import RealMiner from "../models/RealMiner.js";

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
    const miners = await RealMiner.find().session(session);
    for (const miner of miners) {
      const transaction = await Transaction.find().session(session);
      if (transaction.length > 0) {
        const workerData = await f2pool.getWOrkerHistoryDay(miner.f2PoolId);
      }
    }
  } catch (error) {}
};
