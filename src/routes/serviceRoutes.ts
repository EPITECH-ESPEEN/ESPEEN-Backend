import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { isAuthentificatedUser } from "../middlewares/userAuthentification";
import { discordMessageWebhook } from "../services/discordServices";

const router = express.Router();

router.route("/weather/:city").get(isAuthentificatedUser, getCurrentWeather);
router.route("/discord").post(discordMessageWebhook);

export default router;
