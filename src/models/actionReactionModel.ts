import mongoose, { Schema, Document } from "mongoose";

interface IActionReaction extends Document {
  id: number;
  name: string;
  action_reaction: boolean;
  id_service: number;
  webhook_url?: string;
}

const actionReactionSchema: Schema<IActionReaction> = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Action reaction id is required"],
      unique: true,
    },
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
    webhook_url: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IActionReaction>("ActionReaction", actionReactionSchema);
