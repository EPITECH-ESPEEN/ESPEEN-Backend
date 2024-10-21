import express from "express";
import { getUsers, getUser, updateUser, deleteUser, getUserServices } from "../controllers/userController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/users").get(isAuthenticatedUser, getUsers);
router.route("/users/:id").get(isAuthenticatedUser, getUser);
router.route("/users/:id").put(isAuthenticatedUser, updateUser);
router.route("/users/:id").delete(isAuthenticatedUser, deleteUser);
router.route("/user/services").get(isAuthenticatedUser, getUserServices);

export default router;
