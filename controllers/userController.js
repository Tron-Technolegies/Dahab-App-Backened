import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/User.js";

export const getUserInfo = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) throw new NotFoundError("No user found");
  res.status(200).json({ success: true, user });
};

export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new NotFoundError("No user found");
  user.email = req.body.email;
  user.username = req.body.username;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "profile updated successfully" });
};
