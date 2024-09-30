import mongoose, { Schema, Document } from "mongoose";

interface IServices extends Document {
  uid: number;
  name: string;
}

const servicesSchema: Schema<IServices> = new mongoose.Schema(
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
  },
  { timestamps: true }
);

const Services = mongoose.model<IServices>("Services", servicesSchema);

export default Services;
