import { model, Schema } from "mongoose";

const WorkerSchema = new Schema(
  {
    worker_name: {
      type: String,
    },
    hash_rate_info: {
      type: Object,
    },
    last_share_at: {
      type: Number,
    },
    status: {
      type: Number,
    },
    host: {
      type: String,
    },
    history: {
      type: [Object],
    },
  },
  { timestamps: true }
);

const Worker = model("Worker", WorkerSchema);
export default Worker;
