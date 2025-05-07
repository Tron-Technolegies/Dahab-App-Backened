import { Router } from "express";
import {
  validateAddRealMinerInput,
  validateUpdateRealMinerInput,
} from "../middlewares/validationMiddleware.js";
import {
  addRealMiner,
  getSystemStats,
  updateRealMiner,
} from "../controllers/adminController.js";

const router = Router();

router.post("/addMiner", validateAddRealMinerInput, addRealMiner);
router.patch(
  "/updateMiner/:minerId",
  validateUpdateRealMinerInput,
  updateRealMiner
);
router.get("/stats", getSystemStats);

export default router;
