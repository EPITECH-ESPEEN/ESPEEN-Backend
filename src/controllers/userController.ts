import User from "../models/userModel";
import ApiKey from "../models/apiKeyModels";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";
import { getFormattedToken } from "../utils/token";
import Service from "../models/serviceModel";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    if (!users) return next(new ErrorHandler("Users not found", 404));
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in /api/users route:", error);
    return res.status(500).json({ error: "Failed to process users" });
  }
};

export const getUserbyId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};

export const updateUserbyId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    const { username, email } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};

export const deleteUserbyId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ uid: id });
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    await User.deleteOne({ uid: id });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in /api/users/:id route:", error);
    return res.status(500).json({ error: "Failed to process user" });
  }
};

export const getUserServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getFormattedToken(req);
    if (!token) return next(new ErrorHandler("User token not found", 404));
    const user = await User.findOne({ user_token: token });
    const key = await ApiKey.find({ user_id: user?.uid });
    if (!user) return next(new ErrorHandler("User services not found", 404));
    const services = key.map((service) => service.service);
    return res.status(200).json({ services });
  } catch (error) {
    console.error("Error in /api/user/services route:", error);
    return res.status(500).json({ error: "Failed to process user services" });
  }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getFormattedToken(req);
    if (!token) return next(new ErrorHandler("User token not found", 404));
    const user = await User.findOne({ user_token: token });
    if (!user) return next(new ErrorHandler("User not found", 404));
    // TODO : parse to send action reaction "action1 | webhook" for example calling db services to get the action reaction by their name and then getting the field in the service db
    return res.status(200).json({ user });
    } catch (error) {
      console.error("Error in /api/user route:", error);
      return res.status(500).json({ error: "Failed to process user" });
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getFormattedToken(req);
    if (!token) return next(new ErrorHandler("User token not found", 404));
    const user = await User.findOne({user_token: token});
    if (!user) return next(new ErrorHandler("User not found", 404));
    const {username, email, actionReaction} = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    /*
    [ action, reaction|webhook],
    [ action, reaction|webhook],
     */
    // for (const key in actionReaction) {
    //   for (let i = 0; i < actionReaction[key].length; i++) {
    //     if (actionReaction[key][i].split("|")) {
    //       const AorR = actionReaction[key][i].split("|")[0];
    //       const field = actionReaction[key][i].split("|")[1];
    //       actionReaction[key][i] = AorR;
    //       const path = AorR.split(".")[0];
    //         const service = await ApiKey.findOne({user_id: user.uid, service: path});
    //         const serviceDb = await Service.findOne({service: path});
    //         // find in serviceDb.action and reaction the field name of AorR
    //         // if field is found, update the field with the value of field
    //         if (serviceDb) {
    //           for (const i in serviceDb) {
    //             if (serviceDb[i]) {
    //               service.action = field;
    //             } else if (serviceDb.reaction.includes(AorR)) {
    //               service.reaction = field;
    //             }
    //             await service.save();
    //           } else if (serviceDb.reaction.includes(AorR)) {
    //             service.reaction = field;
    //           }
    //           await service.save();
    //         }
    //     }
    // }
    user.actionReaction = actionReaction || user.actionReaction;
    // TODO : parse action reaction "action1 | webhook" for example
    await user.save();
    return res.status(200).json({user});
  } catch (error) {
    console.error("Error in /api/user route:", error);
    return res.status(500).json({error: "Failed to process user"});
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = getFormattedToken(req);
        if (!token) return next(new ErrorHandler("User token not found", 404));
        const user = await User.findOne({user_token: token});
        if (!user) return next(new ErrorHandler("User not found", 404));
        await User.deleteOne({user_token: token});
        return res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        console.error("Error in /api/user route:", error);
        return res.status(500).json({error: "Failed to process user"});
    }
};

export const getUserServicesbyId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({uid: id});
    if (!user) return next(new ErrorHandler(`User with ID ${id} not found`, 404));
    const user_services = user.actionReaction;
    if (!user_services) return next(new ErrorHandler("User services not found", 404));
    return res.status(200).json({user_services});
  } catch (error) {
    console.error("Error in /api/users/:id/services route:", error);
    return res.status(500).json({error: "Failed to process user services"});
  }
};