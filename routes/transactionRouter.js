import { Router } from "express";
import {
  getTransactionData,
  syncTransactions,
  syncVirtualTransactions,
} from "../controllers/TransactionController.js";

const router = Router();

router.get("/", getTransactionData);
router.patch("/syncTransaction", syncTransactions);
router.patch("/syncVirtualTransaction", syncVirtualTransactions);

export default router;
