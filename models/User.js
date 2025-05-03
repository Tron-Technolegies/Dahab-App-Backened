const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    username: {
      type: String,
    },
    otp: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    walletAddress: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profilePicUrl: {
      type: String,
    },
    profilePicPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);
export default User;
