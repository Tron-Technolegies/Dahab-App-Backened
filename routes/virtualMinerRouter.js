import { Router } from "express";
import {
  getAllVirtualMiners,
  getUserMiners,
  getUserSingleMiner,
  purchaseMiner,
  syncVirtualMiners,
} from "../controllers/virtualMinerController.js";
import { validatePurchaseMinerInput } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllVirtualMiners);
router.get("/syncMiners", syncVirtualMiners);
router.post("/purchase", validatePurchaseMinerInput, purchaseMiner);
router.get("/user", getUserMiners);
router.get("/user/:minerId", getUserSingleMiner);

export default router;
