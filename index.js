import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import mongoose from "mongoose";
import morgan from "morgan";
import { v2 as cloudinary } from "cloudinary";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";
import { authenticateUser, isAdmin } from "./middlewares/authMiddleware.js";

import AuthRouter from "./routes/authRouter.js";
import UserRouter from "./routes/userRouter.js";
import VirtualMinerRouter from "./routes/virtualMinerRouter.js";
import RewardRouter from "./routes/rewardRouter.js";
import WithdrawalRouter from "./routes/withdrawalRouter.js";
import AdminRouter from "./routes/adminRouter.js";
import WorkerRouter from "./routes/workerRouter.js";
import TransactionRouter from "./routes/transactionRouter.js";
// import { distributeRewards } from "./controllers/rewardController.js";

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const _dirname = dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(_dirname, "./public")));
app.use(morgan("tiny"));

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", authenticateUser, UserRouter);
app.use("/api/v1/virtual", authenticateUser, VirtualMinerRouter);
app.use("/api/v1/reward", authenticateUser, RewardRouter);
app.use("/api/v1/withdraw", authenticateUser, WithdrawalRouter);
app.use("/api/v1/admin", authenticateUser, isAdmin, AdminRouter);
app.use("/api/v1/worker", authenticateUser, isAdmin, WorkerRouter);
app.use("/api/v1/transaction", authenticateUser, isAdmin, TransactionRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "not found" }); //this error will trigger when the request route do not match any of the above routes
});

app.use(errorHandlerMiddleware); //all errors other than 404

const port = 3000 || process.env.port;
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("database successfully connected");
  // cron.schedule("0 0 * * *", () => {
  //   console.log("Running daily reward distribution...");
  //   distributeRewards();
  // });
  app.listen(port, () => {
    console.log(`server connected on ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
