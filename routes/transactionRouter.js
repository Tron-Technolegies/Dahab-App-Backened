import { Router } from "express";
import { getTransactionData } from "../controllers/TransactionController.js";

const router = Router();

router.get("/", getTransactionData);

export default router;
