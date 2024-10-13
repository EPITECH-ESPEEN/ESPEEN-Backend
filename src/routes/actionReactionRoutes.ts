import express from "express";
import { getAllActionReactions, getActionReactionById, createActionReaction, updateActionReaction, deleteActionReaction } from "../controllers/actionReactionController";

const router = express.Router();

router.route("/actionReactions").get(getAllActionReactions);
router.route("/actionReactions/:id").get(getActionReactionById);
router.route("/actionReactions").post(createActionReaction);
router.route("/actionReactions/:id").put(updateActionReaction);
router.route("/actionReactions/:id").delete(deleteActionReaction);

export default router;
