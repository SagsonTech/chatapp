import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import errorHandlerMiddleware, {
  AppError,
} from "./middlewares/errorHandler.middleware";
import authRoute from "./routes/auth.route";
import connectDB from "./config/db.config";

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);

app.use(errorHandlerMiddleware);

export default app;
