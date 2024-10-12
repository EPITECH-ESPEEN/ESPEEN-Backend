import { Request, Response, NextFunction } from "express";
import Service from "../models/serviceModel";
import ErrorHandler from "../utils/errorHandler";
import { UserRole } from "../models/userModel";

// Get all services : /api/services
export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get a service by id : /api/services/:id
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Create a new service : /api/services
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const service = await Service.create(req.body);
    res.status(201).json({
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Update a service by id : /api/services/:id
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Delete a service by id : /api/services/:id
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return next(new ErrorHandler("Unauthenticated", 401));
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
