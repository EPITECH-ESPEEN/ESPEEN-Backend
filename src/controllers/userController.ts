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
    user.role = req.body.role || user.role;
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
    console.log(services);
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
    let actionReaction = user.actionReaction;
    for (let i = 0; i < actionReaction.length; i++) {
      for (let j = 0; j < actionReaction[i].length; j++) {
        let part = actionReaction[i][j].split(".")[0];
        part = part.charAt(0).toUpperCase() + part.slice(1);
        const service = await Service.findOne({name: part});
        if (!service) return next(new ErrorHandler("Service not found", 404));
        const s_name = service.name.charAt(0).toLowerCase() + service.name.slice(1);
        const apikey = await ApiKey.findOne({user_id: user.uid, service: s_name});
        if (!apikey) return next(new ErrorHandler("Api key not found", 404));
        let field = [{name: "none", type: "text"}];
        if (j === 0) {
            for (let k = 0; k < service.actions.length; k++) {
                if (service.actions[k].name === actionReaction[i][j]) {
                    field = service.actions[k].fields;
                    if (field.length === 0) break;
                    if (apikey.webhook && field[0].name === "webhook") {
                      actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.webhook;
                    }
                    if (apikey.channel && field[0].name === "channel") {
                      actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.channel;
                    }
                    if (apikey.city && field[0].name === "city") {
                        actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.city;
                    }
                }
            }
        } else {
            for (let k = 0; k < service.reactions.length; k++) {
                if (service.reactions[k].name === actionReaction[i][j]) {
                  field = service.reactions[k].fields;
                  if (field.length === 0) break;
                    if (apikey.webhook && field[0].name === "webhook") {
                        actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.webhook;
                    }
                    if (apikey.channel && field[0].name === "channel") {
                        actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.channel;
                    }
                    if (apikey.city && field[0].name === "city") {
                        actionReaction[i][j] = actionReaction[i][j] + "|" + apikey.city;
                    }
                }
            }
        }
      }
    }
    const formattedUser = {
        uid: user.uid,
        username: user.username,
        role: user.role,
        email: user.email,
        actionReaction: actionReaction,
    }

    return res.status(200).json({ user: formattedUser });
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

    for (let i = 0; i < actionReaction.length; i++) {
      for (let j = 0; j < actionReaction[i].length; j++) {
        let part = actionReaction[i][j].split("|")[0].split(".")[0];
        part = part.charAt(0).toUpperCase() + part.slice(1);
        const service = await Service.findOne({name: part});
        if (!service) return next(new ErrorHandler("Service not found", 404));
        let field = [{name: "none", type: "text"}];
        if (j === 0) {
             for (let k = 0; k < service.actions.length; k++) {
                if (service.actions[k].name === actionReaction[i][j].split("|")[0]) {
                   field = service.actions[k].fields;
                 }
             }
        } else {
            for (let k = 0; k < service.reactions.length; k++) {
                if (service.reactions[k].name === actionReaction[i][j].split("|")[0]) {
                  field = service.reactions[k].fields;
                }
            }
        }
        const s_name = service.name.charAt(0).toLowerCase() + service.name.slice(1);
        const apikey = await ApiKey.findOne({user_id: user.uid, service: s_name});
        if (!apikey) return next(new ErrorHandler("Api key not found", 404));
        if (Object.keys(field).length === 0) {
          continue;
        }
        if (field[0].name == "webhook") {
            apikey.webhook = actionReaction[i][j].split("|")[1];
        } if (field[0].name == "channel") {
            apikey.channel = actionReaction[i][j].split("|")[1];
        } if (field[0].name == "city") {
            apikey.city = actionReaction[i][j].split("|")[1];
        }
        await apikey.save();
        actionReaction[i][j] = actionReaction[i][j].split("|")[0];
      }
    }
    user.actionReaction = actionReaction || user.actionReaction;
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