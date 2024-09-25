import mongoose from "mongoose";

export const connectDB = async () => {
  let DB_URI = "";

  if (process.env.NODE_ENV == "DEV") DB_URI = process.env.DB_LOCAL_URI;
  if (process.env.NODE_ENV == "PROD") DB_URI = process.env.DB_URI;
  console.log("\x1b[33m%s\x1b[0m", `[INFO] Connecting to MongoDB with URI: ${DB_URI}`);
  await mongoose
    .connect(DB_URI)
    .then((con) => {
      console.log("\x1b[34m%s\x1b[0m", `[INFO] MongoDB is connected with HOST: ${con?.connection?.host}`);
    })
    .catch((error) => {
      console.error("\x1b[31m%s\x1b[0m", "[ERROR] Connecting to MongoDB:", error);
    });
};
