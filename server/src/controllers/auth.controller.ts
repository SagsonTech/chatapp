import { Request, Response } from "express";
import { ISignupBody } from "../interfaces/requestBody.interfaces";
import { AppError } from "../middlewares/errorHandler.middleware";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import asyncErrorHandlerMiddleware from "../middlewares/asyncErrorHandler.middleware";
import jwt from "jsonwebtoken";
import envVars from "../config/envVars.config";

interface IAuthTokenPayload {
  userId: string;
  username: string;
  email: string;
  profilePicture: {
    url: string;
  };
}

class AuthController {
  private saltRounds: number;
  private jwtSecretKey: string;

  constructor() {
    this.saltRounds = 10;
    this.jwtSecretKey = envVars.JWT_SECRET;
  }

  public signup = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const signupBody: ISignupBody = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      };

      if (!signupBody.email || !signupBody.password || !signupBody.username)
        throw new AppError("Missing user input", 400);

      signupBody.email = signupBody.email.trim().toLowerCase();
      const user = await User.findOne({ email: signupBody.email });
      if (user) throw new AppError("Email already exists", 400);

      const hashedPassword = await bcrypt.hash(
        signupBody.password,
        this.saltRounds,
      );

      const newUser = new User({
        username: signupBody.username,
        email: signupBody.email,
        password: hashedPassword,
      });
      await newUser.save();

      const authTokenPayload = {
        userId: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        profilePicture: { url: newUser.profilePicture?.url || "" },
      };

      const token = await this.generateToken(authTokenPayload);

      this.sendCookie(token, res);

      return res.status(200).json({
        user: authTokenPayload,
        message: "Signed up successfully",
        success: true,
      });
    },
  );

  private generateToken(payload: IAuthTokenPayload) {
    const token = jwt.sign(payload, this.jwtSecretKey, { expiresIn: "7d" });
    return token;
  }

  private sendCookie(token: string, res: Response) {
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}

export default AuthController;
