import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import User from "../models/userModel";
import { Request, Response, NextFunction } from "express";

export const getUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find();

  res.status(200).json({
    users,
  });
});
