import { Router } from "express";
import {
  getWithdrawHistory,
  processWithdrawal,
  requestWithdraw,
} from "../controllers/withdrawalController.js";
import {
  validateProcessWithdrawInput,
  validateWithdrawInput,
} from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getWithdrawHistory);
router.post("/", validateWithdrawInput, requestWithdraw);
router.post(
  "/process",
  isAdmin,
  validateProcessWithdrawInput,
  processWithdrawal
);

export default router;
