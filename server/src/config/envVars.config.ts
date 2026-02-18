import dotenv from "dotenv";
import { IEnvVarsConfig } from "../interfaces/envVarsConfig.interface";
dotenv.config();

const envVars: IEnvVarsConfig = {
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as string,
};

export default envVars;
