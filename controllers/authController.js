import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createJWT } from "../utils/jwtUtils.js";
import { sendMail, transporter } from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const newUser = new User({
    email,
    password: hashedPassword,
  });
  const code = Math.floor(1000 + Math.random() * 9000); //generating random otp
  newUser.otp = code;
  await newUser.save();

  const mailOptions = {
    from: {
      name: "Dahab Mining App",
      address: process.env.NODEMAILER_EMAIL,
    },
    to: newUser.email, //sending email to newUser
    subject: "Verification code",
    text: `You have requested a verification code for your Dahab Mining App account registration. Your verification code is ${code}`,
  };
  await sendMail(transporter, mailOptions);

  const token = createJWT({ userId: newUser._id }); //created token using the newly created users id and role as payload
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res
    .status(201)
    .json({ success: true, message: "successfully registered", token });
};

export const verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("No user has been found");
  if (user.otp === otp) {
    user.isVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: "verification success" });
  } else throw new UnauthenticatedError("Invalid Otp");
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("No user found");
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new BadRequestError("Invalid credentials");
  const token = createJWT({ userId: user._id }); //created token using the newly created users id and role as payload
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res
    .status(200)
    .json({ success: true, message: "logged in successfully", token });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("No user found");
  const code = Math.floor(1000 + Math.random() * 9000);
  user.otp = code;
  await user.save();
  const mailOptions = {
    from: {
      name: "Dahab Mining App",
      address: process.env.NODEMAILER_EMAIL,
    },
    to: email,
    subject: "Verification Code for Password Request",
    text: `Your request for password reset has been recieved. Your verification code is ${code}`,
  };
  await sendMail(transporter, mailOptions);
  res
    .status(200)
    .json({ success: true, message: "verification code sent to email" });
};

export const verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("No user has been found");
  if (user.otp === otp) {
    res.status(200).json({ success: true, message: "verification success" });
  } else throw new UnauthenticatedError("Invalid Otp");
};

export const resetPassword = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) throw new NotFoundError("No user has been found");
  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
};

export const logout = async (req, res) => {
  // const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  // if (!token) throw new UnauthenticatedError("unable to access");
  // const decoded = verifyJWT(token);
  // decoded.exp = Date.now();
  const token = jwt.sign({ userId: "logout" }, process.env.JWT_SECRET, {
    expiresIn: "1s",
  });
  const tenDay = 1000 * 60 * 60 * 24 * 10;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + tenDay),
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully ", token });
};
