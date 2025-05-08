import { Router } from "express";
import {
  validateAddRealMinerInput,
  validateUpdateRealMinerInput,
} from "../middlewares/validationMiddleware.js";
import {
  addRealMiner,
  getAllRealMiners,
  getSystemStats,
  syncRealMinersWithPool,
  updateRealMiner,
} from "../controllers/adminController.js";

const router = Router();

router.get("/miners", getAllRealMiners);
router.post("/addMiner", validateAddRealMinerInput, addRealMiner);
router.patch(
  "/updateMiner/:minerId",
  validateUpdateRealMinerInput,
  updateRealMiner
);
router.get("/stats", getSystemStats);
router.get("/syncMiners", syncRealMinersWithPool);

export default router;
