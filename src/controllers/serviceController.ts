import { Request, Response, NextFunction } from "express";
import Service from "../models/serviceModel";
import User from "../models/userModel";

// Get all services : /api/services
export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Get all services");
    const services = await Service.find({});
    console.log("Services:", services);
    return res.status(200).json({ services });
  } catch (error) {
    console.log("Error in /api/services route:", error);
    return res.status(500).json({ error: "Failed to process services" });
  }
};

// Get a service by id : /api/services/:id
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findOne({ service_id: req.params.id });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({ service });
  } catch (error) {
    console.log("Error in /api/services/:id route:", error);
    return res.status(500).json({ error: "Failed to process service" });
  }
};

// Create a new service : /api/area
export const makeArea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Auth = req.headers.authorization;
    if (!Auth) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = Auth.split(" ")[1];
    const token_id = await User.findOne({ user_token: token });
    if (!token_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({ uid: token_id?.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const actionReaction = [["google.gmail.recep_email", "meteo", "google.gmail.send"]];
    user.actionReaction = actionReaction;
    user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error in /api/area route:", error);
    return res.status(500).json({ error: "Failed to process area" });
  }
};
