import mongoose, { Schema, Document } from "mongoose";

interface IService extends Document {
  uid: number;
  name: string;
  icon: string;
  buttons: { name: string; path: string }[];
  actions: { action_id: string; name: string }[];
  reactions: { reaction_id: string; name: string }[];
}

const serviceSchema: Schema<IService> = new mongoose.Schema(
  {
    uid: {
      type: Number,
      required: [true, "Service id is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
    },
    icon: {
      type: String,
      required: [true, "Service icon is required"],
    },
    buttons: [
      {
        name: {
          type: String,
          required: [true, "Button name is required"],
        },
        path: {
          type: String,
          required: [true, "Button path is required"],
        },
      },
    ],
    actions: [
      {
        action_id: {
          type: String,
          required: [true, "Action id is required"],
        },
        name: {
          type: String,
          required: [true, "Action name is required"],
        },
      },
    ],
    reactions: [
      {
        reaction_id: {
          type: String,
          required: [true, "Reaction id is required"],
        },
        name: {
          type: String,
          required: [true, "Reaction name is required"],
        },
      },
    ],
  },
  { timestamps: true }
);

const Service = mongoose.model<IService>("Services", serviceSchema);

export default Service;
