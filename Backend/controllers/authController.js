import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  if (!username || !email || !password || !confirmPassword) {
    return next(new AppError("All field are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Password do not match", 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new AppError("Email or username already exists", 409));
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new AppError("Invalid Credentials", 400));
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );

 res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

  res.status(200).json({
    success: true,
    message: "Login Successfully",
    accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export const refresh = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token missing", 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.status(200).json({
    success: true,
    accessToken,
  });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/${resetToken}`;

  const message = `Reset your password using this link:\n\n${resetUrl}`;

  await sendEmail(user.email, "Password reset", message);
  res.status(200).json({
    success: true,
    message: "Reset link send to email",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new AppError("password and confirmPassword are required", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Password does not match", 400));
  }

  const token = req.params.token;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  user.password = password;

  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});
