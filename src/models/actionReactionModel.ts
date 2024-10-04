import mongoose, { Schema, Document } from "mongoose";

interface IActionReaction extends Document {
  name: string;
  action_reaction: boolean;
  id_service: number;
}

const actionReactionSchema: Schema<IActionReaction> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Action reaction name is required"],
    },
    action_reaction: {
      type: Boolean,
      required: [true, "Action reaction value is required"],
    },
    id_service: {
      type: Number,
      required: [true, "Service id is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IActionReaction>("ActionReaction", actionReactionSchema);