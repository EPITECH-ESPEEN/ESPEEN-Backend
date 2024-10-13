import { Request, Response, NextFunction } from "express";

import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import User, { UserRole } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
export const registerUser = async (req: Request<{}, {}, RegisterUserBody>, res: Response, next: NextFunction) => {
  try {
    const {username, email, password} = req.body;
    const lastCustomer = await User.findOne().sort({uid: -1}).exec();
    const newId = lastCustomer ? lastCustomer.uid + 1 : 1;
    const hashPassword = await bcrypt.hash(password, 10);
    const payload = {
      uid: newId,
      username: username,
      email: email,
    }
    const secret_key = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret_key);
    const formattedData = {
      uid: newId,
      username: username,
      email: email,
      password: hashPassword,
      user_token: token,
    };
    await User.create(formattedData);
    return res.status(200).json({access_token: token});
  } catch (error) {
    console.error("Error in /api/login route:", error);
    return res.status(500).json({ error: "Failed to process login" });
  }
};

// Login user : /api/login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({username: username});
    if (!user) {
      return res.status(404).json({error : "User not found"});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({error : "Invalid password"});
    }
    return res.status(200).json({access_token: user.user_token});

  } catch (error) {
    console.log("Error in api/login route:", error)
  }
};

export const getUserProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return res.status(400).json({ message: "User ID not provided" });
    }
    const user = await User.findOne({ uid: userUid }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in /api/profile route:", error);
  }
};


export const setUserProfile = catchAsyncErrors(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userUid = req.user?.uid;
  const updates = req.body;

  const user = await User.findOne({ uid: userUid });

  if (!user) {
    return next(new ErrorHandler(`User with ID ${userUid} not found`, 404));
  }

  const forbiddenFields = ["uid", "role"];
  forbiddenFields.map((x) => {
    if (updates[x]) return next(new ErrorHandler(`User tried to change ${x}. This is not permitted`, 400));
  });

  Object.assign(user, updates);
  await user.save();

  const { password, ...clearedUser } = user;

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: clearedUser,
  });
});
