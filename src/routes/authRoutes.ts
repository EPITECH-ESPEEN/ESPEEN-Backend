import express from "express";
import { registerUser, loginUser, getUserProfile, setUserProfile } from "../controllers/authController";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/profile").get(getUserProfile);
router.route("/profile").post(setUserProfile);

export default router;
