import { Request, Response, NextFunction } from "express";
import ApiKey from "../models/apiKeyModels";
import ErrorHandler from "../utils/errorHandler";
import User from "../models/userModel";

// Get all apiKeys : /api/apiKeys
export const getAllApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKeys = await ApiKey.find({});
    res.status(200).json({
      apiKeys,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Get a apiKey by id : /api/apiKeys/:id
export const getApiKeyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await ApiKey.find({ user_id: req.params.id });
    if (!apiKey) {
      return next(new ErrorHandler("ApiKey not found", 404));
    }
    res.status(200).json({
      apiKey,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Create a new apiKey : /api/apiKeys
export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ user_id: req.body.user });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const apiKey = await ApiKey.create(req.body);
    res.status(201).json({
      apiKey,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Update a apiKey by id : /api/apiKeys/:id
export const updateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await ApiKey.findOneAndUpdate({ user_id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!apiKey) {
      return next(new ErrorHandler("ApiKey not found", 404));
    }
    res.status(200).json({
      apiKey,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const createAndUpdateApiKey = async (api_key: string, refresh_token: string, user_id: string, service: string) => {
  const existingApiKey = await ApiKey.findOne({ user_id, service });
  if (existingApiKey) {
    existingApiKey.api_key = api_key;
    existingApiKey.refresh_token = refresh_token;
    await existingApiKey.save();
    return existingApiKey;
  } else {
    const newApiKey = new ApiKey({
      user_id,
      api_key,
      refresh_token,
      service,
    });
    await newApiKey.save();
    return newApiKey;
  }
};
