import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "./catchAsyncErrors";
import User from "../models/userModel";
import { NextFunction, Request, Response } from "express";

interface AuthentificatedRequest extends Request {
  user?: any;
}

export const isAuthentificatedUser = catchAsyncErrors(async (req: AuthentificatedRequest, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Login required to access this resource", 401));
  }

  if (!process.env.JWT_SECRET) {
    return next(new ErrorHandler("JWT secret is not defined", 500));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
  req.user = await User.findById(decoded.id);

  next();
});

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthentificatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ErrorHandler(`Role '${req.user.role}' is not allowed to access this ressource`, 403));
    }
    next();
  };
};
