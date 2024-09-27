import express from "express";
import { registerUser, loginUser, logoutUser, getUserProfile } from "../controllers/authController";
import { isAuthentificatedUser } from "../middlewares/userAuthentification";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/profile").get(isAuthentificatedUser, getUserProfile);

export default router;
