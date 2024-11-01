import { Request, Response, NextFunction } from "express";
import ActionReaction from "../models/actionReactionModel";
import ErrorHandler from "../utils/errorHandler";
import { UserRole } from "../models/userModel";

// Get all actionReactions : /api/actionReactionscondition
export const getAllActionReactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionReactions = await ActionReaction.find({});
    if (!actionReactions) {
      return res.status(404).json({ message: "ActionReactions not found" });
    }
    return res.status(200).json({ actionReactions });
  } catch (error) {
    console.error("Error in /api/actionReactions route:", error);
    return res.status(500).json({ error: "Failed to process ActionReactions" });
  }
};

// Get a actionReaction by id : /api/actionReactions/:id
export const getActionReactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actionReaction = await ActionReaction.findOne({ id: req.params.id });
    if (!actionReaction) {
      return res.status(404).json({ message: "ActionReaction not found" });
    }
    return res.status(200).json({ actionReaction });
  } catch (error) {
    console.error("Error in /api/actionReactions/:id route:", error);
    return res.status(500).json({ error: "Failed to process ActionReaction" });
  }
};

// Create a new actionReaction : /api/actionReactions
export const createActionReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || (req.user as any).role !== UserRole.ADMIN) {
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
    if (!req.user || (req.user as any).role !== UserRole.ADMIN) {
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
    if (!req.user || (req.user as any).role !== UserRole.ADMIN) {
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
