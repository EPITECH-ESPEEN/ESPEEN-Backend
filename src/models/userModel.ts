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
