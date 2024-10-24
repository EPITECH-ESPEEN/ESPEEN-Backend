import { Request, Response, NextFunction } from "express";
import Service from "../models/serviceModel";
import {getFormattedToken} from "../utils/token";
import ErrorHandler from "../utils/errorHandler";

// Get all services : /api/services
export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getFormattedToken(req);
    if (!token) return next(new ErrorHandler("User token not found", 404));
    const services = await Service.find({});
    return res.status(200).json({ services });
  } catch (error) {
    console.log("Error in /api/services route:", error);
    return res.status(500).json({ error: "Failed to process services" });
  }
};

// Get a service by id : /api/services/:id
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findOne({ uid: req.params.id });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({ service });
  } catch (error) {
    console.log("Error in /api/services/:id route:", error);
    return res.status(500).json({ error: "Failed to process service" });
  }
};
