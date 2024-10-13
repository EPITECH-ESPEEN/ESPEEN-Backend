import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { getAllServices, getServiceById } from "../controllers/serviceController";

const router = express.Router();

router.route("/services").get(getAllServices);
router.route("/services/:id").get(getServiceById);
router.route("/weather/:city").get(getCurrentWeather);

export default router;
