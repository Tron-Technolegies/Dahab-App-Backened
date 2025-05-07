import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/customErrors.js";
import User from "../models/User.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format")
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) throw new BadRequestError("Email already exists");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      "password must contain at least one letter,one number, and can include special characters"
    ),
]);

export const validateRegisterOtpInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("otp").notEmpty().withMessage("OTP is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);

export const validateForgotPasswordInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format"),
]);

export const validateUpdateProfileInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid Email Id")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email });
      if (user && user._id.toString() !== req.user.userId.toString()) {
        throw new BadRequestError("email already exists");
      }
    }),
  body("username").notEmpty().withMessage("Username is required"),
]);

export const validatePurchaseMinerInput = withValidationErrors([
  body("realMinerId")
    .notEmpty()
    .withMessage("Real miner Id is required")
    .isMongoId()
    .withMessage("Invalid Id"),
  body("hashRate").notEmpty().withMessage("HashRate is required"),
]);

export const validateWithdrawInput = withValidationErrors([
  body("amount").notEmpty().withMessage("Amount field is required"),
  body("walletAddress").notEmpty().withMessage("Wallet Address is required"),
]);

export const validateProcessWithdrawInput = withValidationErrors([
  body("withdrawalId")
    .notEmpty()
    .withMessage("Withdraw Id required")
    .isMongoId()
    .withMessage("Invalid Id"),
  body("status").notEmpty().withMessage("status is required"),
]);

export const validateAddRealMinerInput = withValidationErrors([
  body("minerId").notEmpty().withMessage("Miner Id is required"),
  body("f2PoolId").notEmpty().withMessage("F2pool Id is required"),
  body("totalHashRate").notEmpty().withMessage("Total hash rate is required"),
]);

export const validateUpdateRealMinerInput = withValidationErrors([
  body("status").notEmpty().withMessage("Status is required"),
  body("totalHashRate").notEmpty().withMessage("Hash Rate is required"),
]);
