import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import RealMiner from "../models/RealMiner.js";
import VirtualMiner from "../models/VirtualMiner.js";

export const getAllAvailableMiners = async (req, res) => {
  const miners = await RealMiner.find({ status: "active" });
  if (!miners) throw NotFoundError("No miners has been found");
  res.status(200).json({ success: true, miners });
};

export const purchaseMiner = async (req, res) => {
  const { realMinerId, hashRate } = req.body;
  const newHashRate = parseInt(hashRate) * 1e12;
  const realMiner = await RealMiner.findById(realMinerId);
  if (!realMiner) throw new NotFoundError("No miner found");
  const fraction = newHashRate / realMiner.totalHashRate;
  if (realMiner.availableHashRate < newHashRate)
    throw new BadRequestError("Not enough hash rate available");
  const virtualMiner = new VirtualMiner({
    vmId: `VM-${Date.now()}`,
    userId: req.user.userId,
    realMinerId,
    hashRate: newHashRate,
    h1_hash_rate: fraction * realMiner.h1_hash_rate,
    h24_hash_rate: fraction * realMiner.h24_hash_rate,
    current_hash_rate: newHashRate,
    real_fraction: fraction,
    hash_rate_history: realMiner.hashRate_history.map((history) => {
      return {
        timestamp: history.timestamp,
        hash_rate: fraction * history.hash_rate,
        stale_hash_rate: fraction * history.stale_hash_rate,
        delay_hash_rate: fraction * history.delay_hash_rate,
        local_hash_rate: fraction * history.local_hash_rate,
        normal_reward: fraction * history.normal_reward,
        delay_reward: fraction * history.delay_reward,
        online_miners: history.online_miners,
      };
    }),
  });
  realMiner.allocatedHashRate += newHashRate;
  realMiner.availableHashRate -= newHashRate;
  await Promise.all([realMiner.save(), virtualMiner.save()]);
  res.status(200).json({ success: true, virtualMiner });
};

export const getUserMiners = async (req, res) => {
  const virtualMiners = await VirtualMiner.find({
    userId: req.user.userId,
  }).populate({
    path: "realMinerId",
    select: "f2poolId totalHashRate",
  });
  if (!virtualMiners) throw new NotFoundError("No miners found");
  res.status(200).json({ success: true, virtualMiners });
};

export const getUserSingleMiner = async (req, res) => {
  const virtualMiner = await VirtualMiner.findById(req.params.minerId);
  if (!virtualMiner) throw new NotFoundError("No virtual miner found");
  if (virtualMiner.userId.toString() !== req.user.userId.toString())
    throw new BadRequestError("Miner not owned by user");
  res.status(200).json({ success: true, virtualMiner });
};

export const syncVirtualMiners = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const miners = await VirtualMiner.find().session(session);
    if (!miners) throw new NotFoundError("No virtual miners had been found");
    for (const miner of miners) {
      const real = await RealMiner.findById(miner.realMinerId).session(session);
      if (real) {
        miner.current_hash_rate = miner.real_fraction * real.totalHashRate;
        miner.h1_hash_rate = miner.real_fraction * real.h1_hash_rate;
        miner.h24_hash_rate = miner.real_fraction * real.h24_hash_rate;
        miner.hash_rate_history = real.hashRate_history.map((history) => {
          return {
            timestamp: history.timestamp,
            hash_rate: miner.real_fraction * history.hash_rate,
            stale_hash_rate: miner.real_fraction * history.stale_hash_rate,
            delay_hash_rate: miner.real_fraction * history.delay_hash_rate,
            local_hash_rate: miner.real_fraction * history.local_hash_rate,
            normal_reward: miner.real_fraction * history.normal_reward,
            delay_reward: miner.real_fraction * history.delay_reward,
            online_miners: history.online_miners,
          };
        });
        await miner.save({ session });
      }
    }
    await session.commitTransaction();
    res.status(200).json({ success: true, message: "sync successful" });
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
