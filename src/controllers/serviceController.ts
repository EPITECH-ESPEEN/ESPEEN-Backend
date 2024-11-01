import { Request, Response, NextFunction } from "express";
import Service from "../models/serviceModel";
import ApiKey from "../models/apiKeyModels";
import User from "../models/userModel";
import {getFormattedToken} from "../utils/token";
import ErrorHandler from "../utils/errorHandler";

// Get all services : /api/services
export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getFormattedToken(req);
    if (!token) return next(new ErrorHandler("User token not found", 404));
    const user = await User.findOne({ user_token: token });
    if (!user) return next(new ErrorHandler("User not found", 404));
    const subscribed_services = await ApiKey.find({ user_id: user.uid });
    console.log("subscribed_services");
    const map = subscribed_services.map((service) =>
        service.service.charAt(0).toUpperCase() + service.service.slice(1)
    );
    console.log("map", map);
    const services = await Service.find({ name: { $in: map } });
    const not_subscribed_services = await Service.find({ name: { $nin: map } }).select("-actions -reactions");
    services.push(...not_subscribed_services);
    console.log("services", services);
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
