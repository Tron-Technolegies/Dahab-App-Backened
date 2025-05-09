import mongoose from "mongoose";
import F2PoolAPI from "../services/pool.js";
import Worker from "../models/Worker.js";

export const UpdateWorkers = async (req, res) => {
  const f2pool = new F2PoolAPI();
  const data = await f2pool.getWorkers();
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (data.workers.length > 0) {
      for (const item of data.workers) {
        const isExisting = await Worker.findOne({
          worker_name: item.hash_rate_info.name,
        }).session(session);
        const hashHistory = await f2pool.getWorkerHistory(
          item.hash_rate_info.name
        );
        if (isExisting) {
          isExisting.hash_rate_info = item.hash_rate_info;
          isExisting.last_share_at = item.last_share_at;
          isExisting.status = item.status;
          isExisting.host = item.host;

          isExisting.history = hashHistory.history;
          await isExisting.save({ session });
        }
        if (!isExisting) {
          const newWorker = new Worker({
            ...item,
            worker_name: item.hash_rate_info.name,
            history: hashHistory.history,
          });
          await newWorker.save({ session });
        }
      }
    }
    await session.commitTransaction();
    res.status(200).json({ success: true, message: "successful" });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
