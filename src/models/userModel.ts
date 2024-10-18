import mongoose, { Document } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

interface IUser extends Document {
  uid: number;
  role: UserRole;
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  actionReaction: string[][];
  user_token?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    uid: {
      type: Number,
      required: [true, "User id is required"],
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    username: {
      type: String,
      required: [true, "User name is required"],
      unique: true,
      maxLength: [50, "User name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      minLength: [8, "User password must be longer than 8 characters"],
    },
    phone: {
      type: String,
      maxLength: [20, "User phone number cannot exceed 20 characters"],
      required: false,
    },
    location: {
      type: String,
      maxLength: [100, "User location cannot exceed 100 characters"],
      required: false,
    },
    avatar: {
      type: String,
      public_id: { type: String },
      url: { type: String },
    },
    actionReaction: {
      type: [[String]],
    },
    user_token: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
