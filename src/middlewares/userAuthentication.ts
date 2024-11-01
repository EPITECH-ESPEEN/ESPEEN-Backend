import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import User, { UserRole } from "../models/userModel";
import {getFormattedToken} from "../utils/token";

interface AuthenticatedRequest extends Request {
  user?: {
    uid: number;
    role: UserRole;
  };
}

export const isAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = getFormattedToken(req);
  if (!token) return next(new ErrorHandler("User token not found", 404));
  const user = User.findOne({ token });
  if (!user) {
    return next(new ErrorHandler("Invalid token. Please login again", 401));
  }

  next();
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role '${req.user?.role}' is not allowed to access this resource`, 403));
    }
    next();
  };
};
