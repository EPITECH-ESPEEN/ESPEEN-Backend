import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dataBase";
import errorMiddleware from "./middlewares/errors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/usersRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import aboutJSON from "./routes/aboutJSON";
import googleRouter from "./routes/googleApiRoutes";
import actionReactionRoutes from "./routes/actionReactionRoutes";
import { serviceRouter } from "./utils/serviceRouter";

dotenv.config();
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

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", serviceRoutes);
app.use("/api", googleRouter);
app.use("/api", actionReactionRoutes);
app.use(aboutJSON);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("API is running...");
  serviceRouter();
});

const server = app.listen(process.env.PORT, () => {
  console.log("\x1b[34m%s\x1b[0m", `[INFO] Server started on the PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`Running at http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  const error = err as Error;
  console.log("\x1b[31m%s\x1b[0m", `[ERROR] ${error.message} ${error.stack}`);
  console.log("\x1b[34m%s\x1b[0m", "[INFO] Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
