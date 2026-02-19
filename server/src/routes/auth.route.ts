import express, { Request, Response } from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
const router = express.Router();

const authController = new AuthController();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authMiddleware, authController.logout);

router.get("/checkauth", authMiddleware, authController.checkAuth);

router.post(
  "/update-profile-picture",
  authMiddleware,
  authController.updateProfilePicture,
);

router.post(
  "/update-profile-info",
  authMiddleware,
  authController.updateProfileInfo,
);

export default router;
