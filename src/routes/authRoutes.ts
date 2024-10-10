import express from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, setUserProfile } from "../controllers/authController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/profile").get(isAuthenticatedUser, getUserProfile);
router.route("/profile").post(isAuthenticatedUser, setUserProfile);

export default router;
