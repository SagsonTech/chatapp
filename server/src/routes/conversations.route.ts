import express, { Request, Response } from "express";
import conversationValidationMiddleware from "../middlewares/conversationValidation.middleware";
import ConversationsController from "../controllers/conversations.controller";
const router = express.Router();

const conversationsController = new ConversationsController();

// get or create a conversation
router.post(
  "/direct",
  conversationValidationMiddleware,
  conversationsController.createOrGetConversation,
);

// get all conversations
router.get("/", conversationsController.getConverstions);

// get conversation by id
router.get("/:conversationId", conversationsController.getConversationById);

// delete conversation
router.delete("/:conversationId", (req: Request, res: Response) => {
  res.send("Delete conversation");
});

export default router;
