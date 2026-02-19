import dotenv from "dotenv";
import { IEnvVarsConfig } from "../interfaces/envVarsConfig.interface";
dotenv.config();

const envVars: IEnvVarsConfig = {
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as string,
  COOKIE_AUTH_TOKEN_KEY: process.env.COOKIE_AUTH_TOKEN_KEY as string,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY as string,
};

export default envVars;
