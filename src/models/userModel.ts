import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
  getJWTToken(): string;
  comparePassword(reqPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
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
      validate: {
        validator: function (email: string) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w{2,3})+$/.test(email);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      minLength: [8, "User password must be longer than 8 characters"],
      validate: {
        validator: function (password: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false,
    },
    phone: {
      type: String,
      maxLength: [20, "User phone number cannot exceed 20 characters"],
    },
    location: {
      type: String,
      maxLength: [100, "User location cannot exceed 100 characters"],
    },
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true, _id: false }
);

// Define UID before validation
userSchema.pre<IUser>("validate", async function (next) {
  if (this.isNew) {
    try {
      const highestUidUser = await (this.constructor as mongoose.Model<IUser>)
        .findOne()
        .sort("-uid")
        .exec();
        
      this.uid = highestUidUser ? highestUidUser.uid + 1 : 1;
    } catch (error) {
      return next(new Error("Failed to generate UID"));
    }
  }
  next();
});

// Password encryption
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare user password
userSchema.methods.comparePassword = async function (reqPassword: string): Promise<boolean> {
  return bcrypt.compare(reqPassword, this.password);
};

//Return JWT
userSchema.methods.getJWTToken = function() {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }
  return jwt.sign({ uid: this.uid, role: this.role }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
