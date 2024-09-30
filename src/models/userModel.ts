import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  uid: number;
  name: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(reqPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    uid: {
      type: Number,
      required: [true, "User id is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "User name is required"],
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
      validate: {
        validator: function (password: string) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false,
    },
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (this.isNew) {
    const highestUidUser = await (this.constructor as mongoose.Model<IUser>).findOne().sort("-uid").exec();
    if (highestUidUser) {
      this.uid = highestUidUser.uid + 1;
    } else {
      this.uid = 1;
    }
  }

  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (reqPassword: string): Promise<boolean> {
  return bcrypt.compare(reqPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
