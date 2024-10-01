import { Request, Response, NextFunction } from "express";

import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import User from "../models/userModel";
import sendToken from "../utils/sendToken";

interface RegisterUserBody {
  username: string;
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    uid: number;
    role: UserRole;
  };
}

// Register a new user : /api/register
export const registerUser = catchAsyncErrors(async (req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  const user = await User.create({
    username,
    email,
    password,
  });

  sendToken(user, 201, res);
});

// Login user : /api/login
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

// Logout user : /api/logout
export const logoutUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logged out",
  });
});

//Get user profile : /api/profile
export const getUserProfile = catchAsyncErrors(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {  
  const userUid = req.user?.uid;
  const user = await User.findOne({ uid: userUid });

  if (!user) {
    return next(new ErrorHandler(`User with ID ${userUid} not found`, 404));
  }
  res.status(200).json({
    user,
  });
});
