import { Request, Response, NextFunction } from "express";
import ActionReaction from "../models/actionReactionModel";
import ErrorHandler from "../utils/errorHandler";
import { UserRole } from "../models/userModel";

// Get all actionReactions : /api/actionReactions
export const getAllActionReactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionReactions = await ActionReaction.find();
    res.status(200).json({
      actionReactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get a actionReaction by id : /api/actionReactions/:id
export const getActionReactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionReaction = await ActionReaction.findById(req.params.id);
    if (!actionReaction) {
      return next(new ErrorHandler("ActionReaction not found", 404));
    }
    res.status(200).json({
      actionReaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Create a new actionReaction : /api/actionReactions
export const createActionReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const actionReaction = await ActionReaction.create(req.body);
    res.status(201).json({
      actionReaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Update a actionReaction by id : /api/actionReactions/:id
export const updateActionReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const actionReaction = await ActionReaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!actionReaction) {
      return next(new ErrorHandler("ActionReaction not found", 404));
    }
    res.status(200).json({
      actionReaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Delete a actionReaction by id : /api/actionReactions/:id
export const deleteActionReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const actionReaction = await ActionReaction.findByIdAndDelete(req.params.id);
    if (!actionReaction) {
      return next(new ErrorHandler("ActionReaction not found", 404));
    }
    res.status(204).json({});
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
