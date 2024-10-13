import express from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, setUserProfile } from "../controllers/authController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/profile").get(getUserProfile);
router.route("/profile").post(setUserProfile);

export default router;
