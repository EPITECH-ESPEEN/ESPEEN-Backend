import { Request, Response, NextFunction } from "express";

import User, { UserRole } from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Service from "../models/serviceModel";
import ApiKey from "../models/apiKeyModels";

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
    const { username, email, password } = req.body;
    const lastCustomer = await User.findOne().sort({ uid: -1 }).exec();
    if (!password || password.length < 8)
      return res.status(500).json({ error: "Password is required" });
    const newId = lastCustomer ? lastCustomer.uid + 1 : 1;
    const hashPassword = await bcrypt.hash(password, 10);
    const payload = {
      uid: newId,
      username: username,
      email: email,
    };
    const secret_key = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(payload, secret_key);
    const formattedData = {
      uid: newId,
      username: username,
      email: email,
      password: hashPassword,
      user_token: token,
    };
    await User.create(formattedData);
    const newMeteo = {
        user_id: newId,
        api_key: "none",
        refresh_token: "none",
        service: "meteo",
        city: "none",
    };
    await ApiKey.create(newMeteo);
    return res.status(200).json({ access_token: token });
  } catch (error) {
    console.error("Error in /api/login route:", error);
    return res.status(500).json({ error: "Failed to process register" });
  }
};

// Login user : /api/login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    return res.status(200).json({ access_token: user.user_token });
  } catch (error) {
    console.error("Error in /api/login route:", error);
    return res.status(500).json({ error: "Failed to process login" });
  }
};

// Get user profile : /api/profile
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
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error in /api/profile route:", error);
    return res.status(500).json({ error: "Failed to process profile" });
  }
};

// Update user profile : /api/profile
export const setUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userUid = (req as AuthenticatedRequest).user?.uid;
    if (!userUid) {
      return res.status(400).json({ message: "User ID not provided" });
    }
    const user = await User.findOne({ uid: userUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, email } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error in /api/profile route:", error);
    return res.status(500).json({ error: "Failed to process profile" });
  }
};

export const getOAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const google = await Service.findOne({ name: "Google" });
    if (!google) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({ google });
  } catch (error) {
    console.error("Error in /api/oauth route:", error);
    return res.status(500).json({ error: "Failed to process OAuth" });
  }
}