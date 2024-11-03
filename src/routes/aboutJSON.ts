import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Service from "../models/serviceModel";

const router = express.Router();

const jsonFilePath = path.join(__dirname, "../config/about.json");

const getFormattedServices = async () => {
    const rawServices = await Service.find({});
    const services = [];
    for (const service of rawServices) {
        console.log("service", service);
        const serviceObj = {
            name: service.name,
            actions: service.actions.map((action) => {
                console.log("description", action.description);
                return {
                    name: action.name,
                    description: action.description,
                };
            }),
            reactions: service.reactions.map((reaction) => {
                return {
                    name: reaction.name,
                    description: reaction.description,
                };
            }),
        };
        services.push(serviceObj);
    }
    return services;
}

router.get("/about.json", (req: Request, res: Response) => {
    fs.readFile(jsonFilePath, "utf8", async (err, data) => {
        if (err) {
            console.error("Error reading JSON file", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        try {
            const jsonData = JSON.parse(data);
            jsonData.client.host = req.ip;
            jsonData.server.current_time = Math.floor(Date.now() / 1000) + (Number(process.env.JWT_EXPIRES_TIME) || 0);
            jsonData.services = await getFormattedServices();
            return res.json(jsonData);
        } catch (parseError) {
            console.error("Error parsing JSON file", parseError);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
});

export default router;
