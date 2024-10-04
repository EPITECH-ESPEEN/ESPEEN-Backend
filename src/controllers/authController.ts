import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import User from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import sendToken from "../utils/sendToken";
import { Request, Response, NextFunction } from "express";

export const registerUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });
  sendToken(user, 201, res);
});

export const loginUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

export const logoutUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logged out",
  });
});

export const getUserProfile = catchAsyncErrors(async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    user,
  });
});
