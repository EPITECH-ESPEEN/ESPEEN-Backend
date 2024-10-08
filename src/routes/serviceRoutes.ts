import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/weather/:city").get(isAuthenticatedUser, getCurrentWeather);

export default router;
