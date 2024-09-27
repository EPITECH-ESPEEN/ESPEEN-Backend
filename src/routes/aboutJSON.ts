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
      return res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing JSON file", parseError);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

export default router;
