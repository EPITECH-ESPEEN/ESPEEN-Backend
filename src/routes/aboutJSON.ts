import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const jsonFilePath = path.join(__dirname, "../config/about.json");

router.get("/about.json", (req: Request, res: Response) => {
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    try {
      const jsonData = JSON.parse(data);
      jsonData.client.host = req.ip;
      jsonData.server.current_time = Math.floor(Date.now() / 1000) + (Number(process.env.JWT_EXPIRES_TIME) || 0);
      return res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing JSON file", parseError);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

export default router;
