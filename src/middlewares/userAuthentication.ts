import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import User, { UserRole } from "../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: {
    uid: number;
    role: UserRole;
  };
}

export const isAuthenticatedUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }
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
