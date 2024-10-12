import express from "express";
import { getAllActionReactions, getActionReactionById, createActionReaction, updateActionReaction, deleteActionReaction } from "../controllers/actionReactionController";
import { isAuthenticatedUser } from "../middlewares/userAuthentication";

const router = express.Router();

router.route("/actionReactions").get(isAuthenticatedUser, getAllActionReactions);
router.route("/actionReactions/:id").get(isAuthenticatedUser, getActionReactionById);
router.route("/actionReactions").post(isAuthenticatedUser, createActionReaction);
router.route("/actionReactions/:id").put(isAuthenticatedUser, updateActionReaction);
router.route("/actionReactions/:id").delete(isAuthenticatedUser, deleteActionReaction);

export default router;
