import { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.middleware";
import User from "../models/user.model";

const conversationValidationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const userId = (req as any).userId;
  const targetUserId = req.body.targetUserId;
  if (!targetUserId)
    throw new AppError("target User's Id was not provided", 401);

  if (targetUserId === userId)
    throw new AppError("You cannot start a conversation with yourself", 403);

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const friend = user.friends.find((f) => f._id.toString() == targetUserId);
  if (!friend)
    throw new AppError(
      "You cannot chat as the target user is not in your friend list",
      403,
    );

  next();
};

export default conversationValidationMiddleware;
