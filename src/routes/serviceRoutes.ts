import express from "express";
import { getCurrentWeather } from "../services/weatherServices";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";
import { getAllServices, getServiceById, createService, updateService, deleteService } from "../controllers/serviceController";

const router = express.Router();

router.route("/services").get(isAuthenticatedUser, getAllServices);
router.route("/services/:id").get(isAuthenticatedUser, getServiceById);
router.route("/services").post(isAuthenticatedUser, createService);
router.route("/services/:id").put(isAuthenticatedUser, updateService);
router.route("/services/:id").delete(isAuthenticatedUser, deleteService);

router.route("/weather/:city").get(isAuthenticatedUser, getCurrentWeather);

export default router;
