import ErrorHandler from "../utils/errorHandler";

import { Request, Response, NextFunction } from "express";

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = {
    statusCode: err?.statusCode || 500,
    message: err?.message || "Internal Server Error",
  };

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err?.path}`;
    error = new ErrorHandler(message, 404);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value: any) => value.message)
      .join(", ");
    error = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicated data resource. Invalid ${Object.keys(err.keyValue)}`;
    error = new ErrorHandler(message, 404);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid JSON Web Token";
    error = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Expired JSON Web Token";
    error = new ErrorHandler(message, 400);
  }

  if (process.env.NODE_ENV === "DEV") {
    res.status(error.statusCode).json({
      message: error.message,
      error: err,
      stack: err?.stack,
    });
  }

  if (process.env.NODE_ENV === "PROD") {
    res.status(error.statusCode).json({
      message: error.message,
    });
  }
};
