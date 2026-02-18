import mongoose from "mongoose";
import { AppError } from "../middlewares/errorHandler.middleware";
import envVars from "./envVars.config";

const connectDB = async () => {
  if (!envVars.MONGODB_URI)
    throw new AppError("Unable to connect to the database", 501);
  try {
    await mongoose.connect(envVars.MONGODB_URI);
    console.log("Connected to the database");
  } catch (err: any) {
    console.error(err);
    throw new AppError("Could'nt connect to the database", 500);
  }
};

export default connectDB;
