import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import User, { UserRole } from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

export const getUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role != UserRole.ADMIN)
    return next(new ErrorHandler("Unauthenticated", 401));

  const users = await User.find();

  res.status(200).json({
    users,
  });
});

export const getUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role != UserRole.ADMIN)
    return next(new ErrorHandler("Unauthenticated", 401));

  const id = req.params.id;

  const user = await User.findOne({ uid: id });

  if (!user)
    return next(new ErrorHandler(`User with ID ${id} not found`, 404));

  res.status(200).json({
    user,
  });
})

export const updateUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role != UserRole.ADMIN)
    return next(new ErrorHandler("Unauthenticated", 401));

  const id = req.params.id;

  const user = await User.findOne({ uid: id });

  if (!user)
    return next(new ErrorHandler(`User with ID ${id} not found`, 404));

  const updates = req.body;

  //TODO: Did not test this, code from a friend
  Object.assign(user, updates);
  await user.save();

  //TODO: This hasn't been tested, but should work according to google
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
})

export const deleteUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role != UserRole.ADMIN)
    return next(new ErrorHandler("Unauthenticated", 401));

  const id = req.params.id;

  const user = await User.findOne({ uid: id });

  if (!user)
    return next(new ErrorHandler(`User with ID ${id} not found`, 404));

  await User.deleteOne({uid: id});

  res.status(200).json({
    success: true,
    message: `User ${id} deleted successfully`,
  });
})