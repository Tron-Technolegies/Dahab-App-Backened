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
  if (realMiner.availableHashRate < newHashRate)
    throw new BadRequestError("Not enough hash rate available");
  const virtualMiner = new VirtualMiner({
    vmId: `VM-${Date.now()}`,
    userId: req.user.userId,
    realMinerId,
    hashRate: newHashRate,
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
  const virtualMiner = await VirtualMiner.findById(req.params.minerId).populate(
    {
      path: "realMinerId",
      select: "f2poolId totalHashRate status",
    }
  );
  if (!virtualMiner) throw new NotFoundError("No virtual miner found");
  if (virtualMiner.userId.toString() !== req.user.userId.toString())
    throw new BadRequestError("Miner not owned by user");
  res.status(200).json({ success: true, virtualMiner });
};
