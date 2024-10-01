import express from "express";
import { getUsers } from "../controllers/userController";
import { isAuthentificatedUser  } from "../middlewares/userAuthentification";

const router = express.Router();

router.route("/users").get(isAuthentificatedUser, getUsers);

export default router;
