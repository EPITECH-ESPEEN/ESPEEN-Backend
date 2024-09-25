import express from "express";
import { getCurrentWeather } from "../services/weatherService.js";
import { isAuthenticatedUser } from "../middlewares/userAuthentication.js";

const router = express.Router();

router.route("/weather/:city").get(isAuthenticatedUser, getCurrentWeather);

export default router;