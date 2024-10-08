import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dataBase";
import errorMiddleware from "./middlewares/errors";
import cookieParser from "cookie-parser";
dotenv.config({ path: "config/config.env" });

const app = express();

process.on("uncaughtException", (err) => {
  console.log("\x1b[31m%s\x1b[0m", `[ERROR] ${err} ${err.stack}`);
  console.log("\x1b[34m%s\x1b[0m", "[INFO] Shutting down server due to Unhandled Promise Rejection");
  process.exit(1);
});

dotenv.config({ path: "src/config/config.env" });

connectDB();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/usersRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import aboutJSON from "./routes/aboutJSON";

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", serviceRoutes);
app.use(aboutJSON);

app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
  console.log("\x1b[34m%s\x1b[0m", `[INFO] Server started on the PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

process.on("unhandledRejection", (err) => {
  const error = err as Error;
  console.log("\x1b[31m%s\x1b[0m", `[ERROR] ${error.message} ${error.stack}`);
  console.log("\x1b[34m%s\x1b[0m", "[INFO] Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
