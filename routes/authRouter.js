import { Router } from "express";
import {
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateRegisterOtpInput,
} from "../middlewares/validationMiddleware.js";
import {
  forgotPassword,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  verifyPasswordResetOTP,
  verifyRegisterOtp,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", validateRegisterInput, registerUser);
router.post("/otp-verify", validateRegisterOtpInput, verifyRegisterOtp);
router.post("/login", validateLoginInput, loginUser);
router.post("/forgot-password", validateForgotPasswordInput, forgotPassword);
router.post("/otp-password", validateRegisterOtpInput, verifyPasswordResetOTP);
router.post("/reset-password", validateLoginInput, resetPassword);
router.post("/logout", logout);

export default router;
