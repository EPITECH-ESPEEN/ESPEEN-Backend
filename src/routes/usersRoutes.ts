import express from "express";
import { getUsers, getUser, updateUser, deleteUser } from "../controllers/userController";

const router = express.Router();

router.route("/users").get(getUsers);
router.route("/users/:id").get(getUser);
router.route("/users/:id").put(updateUser);
router.route("/users/:id").delete(deleteUser);

export default router;
