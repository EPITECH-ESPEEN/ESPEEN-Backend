import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { getAllServices, getServiceById, makeArea } from "../controllers/serviceController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/area").post(isAuthenticatedUser, makeArea);
router.route("/services").get(isAuthenticatedUser, getAllServices);
router.route("/services/:id").get(isAuthenticatedUser, getServiceById);
router.route("/weather/:city").get(isAuthenticatedUser, getCurrentWeather);

export default router;
