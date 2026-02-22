import { Request, Response } from "express";
import { ILoginBody, ISignupBody } from "../interfaces/requestBody.interfaces";
import { AppError } from "../middlewares/errorHandler.middleware";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import asyncErrorHandlerMiddleware from "../middlewares/asyncErrorHandler.middleware";
import jwt from "jsonwebtoken";
import envVars from "../config/envVars.config";
import { IAuthTokenPayload } from "../interfaces/auth.interfaces";
import cloudinary from "../config/cloudinary.config";

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

      const token = this.generateToken({ userId: newUser._id.toString() });

      this.sendCookie(token, res);

      const userDataPayload = await User.findById(newUser._id).select(
        "-password",
      );
      return res.status(200).json({
        user: userDataPayload,
        message: "Signed up successfully",
        success: true,
      });
    },
  );

  public login = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const loginBody: ILoginBody = {
        email: req.body.email,
        password: req.body.password,
      };

      if (!loginBody.email || !loginBody.password)
        throw new AppError("Missing user input", 501);

      loginBody.email = loginBody.email.trim().toLowerCase();
      const user = await User.findOne({ email: loginBody.email });
      if (!user) throw new AppError("Invalid username or password", 400);

      const isPasswordCorrect = await bcrypt.compare(
        loginBody.password,
        user.password,
      );
      if (!isPasswordCorrect)
        throw new AppError("Invalid username or password", 400);

      const userDataPayload = await User.findById(user._id).select("-password");

      const authToken = this.generateToken({ userId: user._id.toString() });
      this.sendCookie(authToken, res);

      return res.status(200).json({
        user: userDataPayload,
        message: "Logged in successfully",
        success: true,
      });
    },
  );

  public checkAuth = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const userId = (req as any).userId;
      if (!userId) throw new AppError("Unauthorized access", 400);

      const user = await User.findById(userId).select("-password");

      return res.status(200).json({
        user,
        message: "User is authenticated",
        success: true,
      });
    },
  );

  public logout = (req: Request, res: Response) => {
    res.clearCookie(envVars.COOKIE_AUTH_TOKEN_KEY);

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  };

  public updateProfilePicture = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { profilePicture } = req.body;
      const userId = (req as any).user.userId;

      if (!profilePicture) {
        throw new AppError("No picture was provided", 502);
      }
      const result = await cloudinary.uploader.upload(profilePicture);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePicture: result.secure_url,
        },
        { new: true },
      );

      if (!updatedUser) throw new AppError("User profile was not updated", 501);

      return res.status(200).json({
        profilePicture: updatedUser.profilePicture,
        message: "Profile picture updated successfully",
        success: true,
      });
    },
  );

  public updateProfileInfo = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { username } = req.body;
      const userId = (req as any).user.userId;

      const user = await User.findById(userId);
      if (!user) throw new AppError("User not found", 404);

      user.username = username;
      await user.save();

      return res.status(200).json({
        username,
        message: "Profile information updated successfully",
        success: true,
      });
    },
  );

  // internal function
  public getUserById = async (userId: string) => {
    const user = await User.findById(userId);
    return user;
  };

  private generateToken(payload: IAuthTokenPayload) {
    const token = jwt.sign(payload, this.jwtSecretKey, { expiresIn: "7d" });
    return token;
  }

  private sendCookie(token: string, res: Response) {
    res.cookie(envVars.COOKIE_AUTH_TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}

export default AuthController;
