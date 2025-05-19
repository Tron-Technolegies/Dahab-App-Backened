import { Router } from "express";
import {
  validateAddRealMinerInput,
  validateUpdateRealMinerInput,
} from "../middlewares/validationMiddleware.js";
import {
  addRealMiner,
  getAllRealMiners,
  getAllUsers,
  getAllVirtualMiners,
  getSingleRealMiner,
  getSystemStats,
  syncRealMinersWithPool,
  updateRealMiner,
} from "../controllers/adminController.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router.get("/miners", getAllRealMiners);
router.get("/miners/:id", getSingleRealMiner);
router.post(
  "/addMiner",
  validateAddRealMinerInput,
  upload.single("minerImage"),
  addRealMiner
);
router.patch(
  "/updateMiner/:id",
  validateUpdateRealMinerInput,
  upload.single("minerImage"),
  updateRealMiner
);
router.get("/stats", getSystemStats);
router.get("/syncMiners", syncRealMinersWithPool);
router.get("/users", getAllUsers);
router.get("/virtual", getAllVirtualMiners);

export default router;
