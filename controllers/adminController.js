import { NotFoundError } from "../errors/customErrors.js";
import RealMiner from "../models/RealMiner.js";
import User from "../models/User.js";
import VirtualMiner from "../models/VirtualMiner.js";

export const addRealMiner = async (req, res) => {
  const { minerId, f2PoolId, totalHashRate } = req.body;
  const realMiner = new RealMiner({
    minerId,
    f2PoolId,
    totalHashRate,
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
