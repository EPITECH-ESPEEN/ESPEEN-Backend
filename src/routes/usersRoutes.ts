import express from "express";
import { getUsers } from "../controllers/userController";
import { isAuthenticatedUser  } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/users").get(isAuthenticatedUser, getUsers);

export default router;
