import express from "express";
import { registerUser, loginUser, getUserProfile, setUserProfile, getOAuth } from "../controllers/authController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/oauth").get(getOAuth);
router.route("/profile").get(isAuthenticatedUser, getUserProfile);
router.route("/profile").post(isAuthenticatedUser, setUserProfile);

export default router;
