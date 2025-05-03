import { Router } from "express";
import {
  getUserInfo,
  updateUserProfile,
} from "../controllers/userController.js";
import { validateUpdateProfileInput } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getUserInfo);
router.patch("/", validateUpdateProfileInput, updateUserProfile);

export default router;
