import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/dataBase";
import usersRoutes from "./routes/usersRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use("/api/users", usersRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
