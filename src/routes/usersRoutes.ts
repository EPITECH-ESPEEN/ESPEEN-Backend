import express from "express";
import { getUsers, getUser, updateUser, deleteUser, getUserServices, deleteUserbyId, updateUserbyId, getUserbyId, getUserServicesbyId }
    from "../controllers/userController";
import { isAuthenticatedAdmin, isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/user").get(isAuthenticatedUser, getUser);
router.route("/user").post(isAuthenticatedUser, updateUser);
router.route("/user/services").get(isAuthenticatedUser, getUserServices);
router.route("/user").delete(isAuthenticatedUser, deleteUser);

router.route("/users").get(isAuthenticatedAdmin, getUsers);
router.route("/users/:id").get(isAuthenticatedAdmin, getUserbyId);
router.route("/users/:id").post(isAuthenticatedAdmin, updateUserbyId);
router.route("/users/:id").delete(isAuthenticatedAdmin, deleteUserbyId);
router.route("/users/:id/services").get(isAuthenticatedAdmin, getUserServicesbyId);

export default router;
