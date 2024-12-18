import express from "express";
import connectDB from "./config/dataBase";
import errorMiddleware from "./middlewares/errors";
import cookieParser from "cookie-parser";
import aboutJSON from "./routes/aboutJSON";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import githubRouter from "./services/githubService"
import userRoutes from "./routes/usersRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import googleRouter from "./services/googleServices";
import actionReactionRoutes from "./routes/actionReactionRoutes";
import discordRouter from "./services/discordServices";
import twitchRouter from "./services/twitchServices";
import { serviceRouter } from "./services/API";

dotenv.config();
const app = express();

const whiteList = ["http://localhost:8081", "https://certain-catfish-splendid.ngrok-free.app"];
const corsOptions = {
  origin: whiteList,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

process.on("uncaughtException", (err) => {
  console.log("\x1b[31m%s\x1b[0m", `[ERROR] ${err} ${err.stack}`);
  console.log("\x1b[34m%s\x1b[0m", "[INFO] Shutting down server due to Unhandled Promise Rejection");
  process.exit(1);
});

connectDB();

app.use(cors({ origin: whiteList, methods: ["GET", "POST", "DELETE", "PUT"] }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", serviceRoutes);
app.use("/api", googleRouter);
app.use("/api", discordRouter);
app.use("/api", twitchRouter);
app.use("/api", githubRouter);
app.use("/api", actionReactionRoutes);
app.use(aboutJSON);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const server = app.listen(process.env.PORT, () => {
  console.log("\x1b[34m%s\x1b[0m", `[INFO] Server started on the PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`Running at http://localhost:${process.env.PORT}`);
  serviceRouter();
});

process.on("unhandledRejection", (err) => {
  const error = err as Error;
  console.log("\x1b[31m%s\x1b[0m", `[ERROR] ${error.message} ${error.stack}`);
  console.log("\x1b[34m%s\x1b[0m", "[INFO] Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
