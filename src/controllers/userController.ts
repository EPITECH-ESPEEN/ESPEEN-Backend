import User from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    if (!users) return next(new ErrorHandler("Users not found", 404));
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in /api/users route:", error);
    return res.status(500).json({ error: "Failed to process users" });
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    const { username, email, phone, location } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.location = location || user.location;
    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    await User.deleteOne({ uid: id });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};
