import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import errorHandlerMiddleware, {
  AppError,
} from "./middlewares/errorHandler.middleware";
import authRoute from "./routes/auth.route";
import connectDB from "./config/db.config";
import requestsRoute from "./routes/requests.route";
import authMiddleware from "./middlewares/auth.middleware";
import friendsRoute from "./routes/friends.route";
import conversationsRoute from "./routes/conversations.route";
import messageRoute from "./routes/message.route";

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/requests", authMiddleware, requestsRoute);
app.use("/api/friends", authMiddleware, friendsRoute);
app.use("/api/conversations", authMiddleware, conversationsRoute);
app.use("/api/messages", authMiddleware, messageRoute);

app.use(errorHandlerMiddleware);

export default app;
