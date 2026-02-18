import express, { Request, Response } from "express";
import AuthController from "../controllers/auth.controller";
const router = express.Router();

const authController = new AuthController();

router.post("/signup", authController.signup);

router.post("/login", (req: Request, res: Response) => {
  res.send("Login route");
});

router.get("/logout", (req: Request, res: Response) => {
  res.send("logout route");
});

export default router;
