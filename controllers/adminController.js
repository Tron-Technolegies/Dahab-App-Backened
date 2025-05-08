import mongoose from "mongoose";
import { NotFoundError } from "../errors/customErrors.js";
import RealMiner from "../models/RealMiner.js";
import User from "../models/User.js";
import VirtualMiner from "../models/VirtualMiner.js";
import Worker from "../models/Worker.js";

export const addRealMiner = async (req, res) => {
  const { minerId, f2PoolId, totalHashRate, minerName } = req.body;
  const realMiner = new RealMiner({
    minerId,
    f2PoolId,
    totalHashRate,
    minerName,
  });
  await realMiner.save();
  res.status(200).json({ success: true, realMiner });
};

export const updateRealMiner = async (req, res) => {
  const { minerId } = req.params;
  const { status, totalHashRate } = req.body;
  const miner = await RealMiner.findOneAndUpdate(
    { minerId },
    { status, totalHashRate },
    { new: true }
  );
  if (!miner) throw new NotFoundError("No miner found");
  res.status(200).json({ success: true, miner });
};

export const getSystemStats = async (req, res) => {
  const [totalUsers, activeMiners, totalHashRate, allocatedHashRate] =
    await Promise.all([
      User.countDocuments(),
      VirtualMiner.countDocuments({ isActive: true }),
      RealMiner.aggregate([
        { $group: { _id: null, total: { $sum: "$totalHashRate" } } },
      ]),
      RealMiner.aggregate([
        { $group: { _id: null, total: { $sum: "$allocatedHashRate" } } },
      ]),
    ]);
  res.status(200).json({
    success: true,
    totalUsers,
    activeMiners,
    totalHashRate: totalHashRate[0]?.total || 0,
    allocatedHashRate: allocatedHashRate[0]?.total || 0,
  });
};

export const getAllRealMiners = async (req, res) => {
  const miners = await RealMiner.find();
  if (!miners) throw new NotFoundError("No miners found");
  res.status(200).json({ success: true, miners });
};

export const syncRealMinersWithPool = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const miners = await RealMiner.find().session(session);
    if (!miners) throw new NotFoundError("No Miners found");
    for (const miner of miners) {
      const worker = await Worker.findOne({
        worker_name: miner.f2PoolId,
      }).session(session);
      if (worker) {
        miner.totalHashRate = worker.hash_rate_info.hash_rate;
        miner.h1_hash_rate = worker.hash_rate_info.h1_hash_rate;
        miner.h24_hash_rate = worker.hash_rate_info.h24_hash_rate;
        miner.hashRate_history = worker.history;
        miner.status = worker.status === 0 ? "active" : "inactive";
        miner.availableHashRate = miner.totalHashRate - miner.allocatedHashRate;
        await miner.save({ session });
      }
    }
    await session.commitTransaction();
    res.status(200).json({ success: true, message: "successfully updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
