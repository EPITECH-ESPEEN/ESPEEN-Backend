import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IToken extends Document {
  uid: number;
  user_uid: number;
  service_uid: number;
  name: string;
  value: string;
  identifier: string;
}

const tokenSchema: Schema<IToken> = new mongoose.Schema(
  {
    uid: {
      type: Number,
      required: [true, "Token id is required"],
      unique: true,
    },
    user_uid: {
      type: Number,
      required: [true, "User id is required"],
    },
    service_uid: {
      type: Number,
      required: [true, "Service id is required"],
    },
    name: {
      type: String,
      required: [true, "Token name is required"],
    },
    value: {
      type: String,
      required: [true, "Token value is required"],
    },
    identifier: {
      type: String,
      required: [true, "Token identifier is required"],
      select: false,
    },
  },
  { timestamps: true }
);

tokenSchema.pre<IToken>("save", async function (next) {
  if (!this.isModified("identifier")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.identifier = await bcrypt.hash(this.identifier, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

tokenSchema.methods.compareIdentifier = async function (plainIdentifier: string): Promise<boolean> {
  return await bcrypt.compare(plainIdentifier, this.identifier);
};

const Tokens = mongoose.model<IToken>("Tokens", tokenSchema);

export default Tokens;
