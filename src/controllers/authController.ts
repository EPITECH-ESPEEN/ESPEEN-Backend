import { Request, Response, NextFunction } from "express";

import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import User, {UserRole} from "../models/userModel";
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
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }
  const user = await User.findOne({ username: username }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }

  sendToken(user, 200, res);
});

// Logout user : /api/logout
export const logoutUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  //NOTE: This is why JWT ain't good.
  // Here, you just say "hey, remove the token plz"
  // But user could just copy paste it again, and be logged in again
  // Not cool
  // Note a _real_ problem tho
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

  //TODO: NEVER send a password
  // bcrypt, hashed, in chinese, i don't give a f, NEVER send a password back to a user !!

  const {
    password,
    // Paste here any other field you wish to NOT send back when calling /api/profile
    ...clearedUser
  } = user;

  res.status(200).json({
    clearedUser
  });
});

export const setUserProfile = catchAsyncErrors(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userUid = req.user?.uid;
  const updates = req.body;

  const user = await User.findOne({ uid: userUid });

  if (!user) {
    return next(new ErrorHandler(`User with ID ${userUid} not found`, 404));
  }

  const forbiddenFields = ['uid', 'role'];
  forbiddenFields.map((x) => {
    if (updates[x])
      return next(new ErrorHandler(`User tried to change ${x}. This is not permitted`, 400));
  });

  //TODO: Did not test this, code from a friend
  Object.assign(user, updates);
  await user.save();

  const {
    password,
    // Paste here any other field you wish to NOT send back when calling /api/profile
    ...clearedUser
  } = user;

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: clearedUser
  });
});