import { NotFoundError } from "../errors/customErrors";
import RealMiner from "../models/RealMiner.js";

export const getAllAvailableMiners = async (req, res) => {
  const miners = await RealMiner.find({ status: "active" });
  if (!miners) throw NotFoundError("No miners has been found");
  const availableMiners = miners.map((item) => {
    return {
      realMinerId: item._id,
      f2poolId: item.f2PoolId,
      availableHashRate: item.availableHashRate,
      totalHashRate: item.totalHashRate,
    };
  });
  res.status(200).json({ success: true, availableMiners });
};
