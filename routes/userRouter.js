import { Router } from "express";
import {
  getUserInfo,
  syncUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { validateUpdateProfileInput } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getUserInfo);
router.patch("/", validateUpdateProfileInput, updateUserProfile);
router.patch("/syncEarnings", syncUserProfile);

export default router;
