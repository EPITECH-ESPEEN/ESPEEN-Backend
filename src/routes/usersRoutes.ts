import express from "express";
import { getUsers, getUser, updateUser, deleteUser, getUserServices, deleteUserbyId, updateUserbyId, getUserbyId, getUserServicesbyId }
    from "../controllers/userController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/user").get(isAuthenticatedUser, getUser);
router.route("/user").post(isAuthenticatedUser, updateUser);
router.route("/user/services").get(isAuthenticatedUser, getUserServices);
router.route("/user").delete(isAuthenticatedUser, deleteUser);

router.route("/users").get(isAuthenticatedUser, getUsers);
router.route("/users/:id").get(isAuthenticatedUser, getUserbyId);
router.route("/users/:id").post(isAuthenticatedUser, updateUserbyId);
router.route("/users/:id").delete(isAuthenticatedUser, deleteUserbyId);
router.route("/users/:id/services").get(isAuthenticatedUser, getUserServicesbyId);

export default router;
