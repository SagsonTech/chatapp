import express, { Request, Response } from "express";
import MessageController from "../controllers/messages.controller";
const router = express.Router();

const messageController = new MessageController();

// get all messages from a conversation
router.get("/:conversationId", messageController.getAllMessages);

// send a message
router.post("/:conversationId", messageController.sendMessage);

// delete a message
router.put("/delete/:messageId", messageController.deleteMessage);

export default router;
