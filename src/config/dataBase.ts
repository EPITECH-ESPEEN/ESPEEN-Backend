import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    let DB_URI = "";

    if (process.env.NODE_ENV == "DEV") DB_URI = process.env.DB_LOCAL_URI || "";
    if (process.env.NODE_ENV == "PROD") DB_URI = process.env.DB_URI || "";
    console.log("\x1b[33m%s\x1b[0m", `[INFO] Connecting to MongoDB with URI: ${DB_URI}`);
    await mongoose.connect(DB_URI as string);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
