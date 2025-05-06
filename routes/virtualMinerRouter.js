import { Router } from "express";
import {
  getAllAvailableMiners,
  getUserMiners,
  getUserSingleMiner,
  purchaseMiner,
} from "../controllers/virtualMinerController.js";
import { validatePurchaseMinerInput } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllAvailableMiners);
router.post("/purchase", validatePurchaseMinerInput, purchaseMiner);
router.get("/user", getUserMiners);
router.get("/user/:minerId", getUserSingleMiner);

export default router;
