import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "./catchAsyncErrors";
import User, { UserRole } from "../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: {
    uid: number;
    role: UserRole;
  };
}

//TODO Authentificated is either brand new, or not a real word
//Check if user is auth
export const isAuthenticatedUser = catchAsyncErrors(async (req: AuthenticatedRequest, res, next) => {
  const {token} = req.cookies;
  if (!token) {
      return next(new ErrorHandler("Login required to access this resource", 401));
  }

  if (!process.env.SECRET_KEY) {
    return next(new ErrorHandler("JWT secret is not defined", 500));
  }
  const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;
  const user = await User.findOne({uid: decoded.uid});
  if (!user) {
    return next(new ErrorHandler(`User with ID ${decoded.uid} not found`, 404));
  }
  req.user = {
    uid: user.uid,
    role: user.role
  };

  next();
});

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role '${req.user?.role}' is not allowed to access this resource`, 403));
    }
    next();
  };
};
