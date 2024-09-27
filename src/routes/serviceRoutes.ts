import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { isAuthentificatedUser } from "../middlewares/userAuthentification";

const router = express.Router();

router.route("/weather/:city").get(isAuthentificatedUser, getCurrentWeather);

export default router;
