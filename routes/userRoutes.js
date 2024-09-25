import express from "express";
import { getUsers } from "../controllers/userController.js";
import { isAuthenticatedUser } from "../middlewares/userAuthentication.js";

const router = express.Router();

// router.route("/users").get(getUsers);
router.route("/users").get(isAuthenticatedUser, getUsers);

export default router;