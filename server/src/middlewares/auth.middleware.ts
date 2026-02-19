import { NextFunction, Request, Response } from "express";
import envVars from "../config/envVars.config";
import { AppError } from "./errorHandler.middleware";
import jwt from "jsonwebtoken";
import { ICookieTokenPayload } from "../interfaces/auth.interfaces";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[envVars.COOKIE_AUTH_TOKEN_KEY];
  if (!token) throw new AppError("Unauthorized access", 400);

  const decoded = jwt.verify(token, envVars.JWT_SECRET) as ICookieTokenPayload;

  (req as any).userId = decoded.userId;

  next();
};

export default authMiddleware;
