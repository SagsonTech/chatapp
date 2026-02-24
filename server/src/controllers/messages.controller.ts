import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler.middleware";
import Message from "../models/message.model";
import asyncErrorHandlerMiddleware from "../middlewares/asyncErrorHandler.middleware";
import { IMessageBody } from "../interfaces/requestBody.interfaces";
import Conversation from "../models/conversation.model";
import mongoose from "mongoose";
import User from "../models/user.model";

class MessageController {
  public getAllMessages = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      let { conversationId } = req.params;
      if (!conversationId)
        throw new AppError("Conversation Id was not provided", 400);

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new AppError("Conversation not found", 404);

      const messages = await Message.find({
        conversationId: conversationId,
      }).sort({ createdAt: -1 });

      const members = conversation.members;
      const messagePayload = await this.createMessagePayload(messages, members);

      res.status(200).json({
        messages: messagePayload,
        success: true,
      });
    },
  );

  public sendMessage = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const messageBody: IMessageBody = {
        messageText: req.body.messageText,
        attachmentImage: req.body.attachmentImage,
      };
      if (!messageBody.messageText)
        throw new AppError("Missing user inputs", 400);
      const userId = (req as any).userId;
      const conversationId = req.params.conversationId;
      if (!conversationId)
        throw new AppError("Conversation Id was not provided", 400);

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new AppError("Conversation not found", 404);
      if (
        !conversation.members.some((member) => member._id.toString() === userId)
      )
        throw new AppError("Access Denied", 403);

      const newMessage = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        messageText: messageBody.messageText,
        attachmentImage: messageBody.attachmentImage,
      });

      conversation.lastMessage = newMessage.messageText;
      conversation.lastMessageAt = newMessage.createdAt;
      await conversation.save();

      const members = conversation.members;
      const messagePayload = await this.createMessagePayload(
        [newMessage],
        members,
      );

      res.status(200).json({
        message: "The message was sent successfully",
        newMessage: messagePayload[0],
        success: true,
      });
    },
  );

  private createMessagePayload = async (
    messages: any[],
    members: mongoose.Types.ObjectId[],
  ) => {
    const memberPayloads = await User.find({ _id: { $in: members } })
      .select("username")
      .select("profilePicture");

    const messagePayload = messages.map((message) => {
      const payload = {
        messageId: message._id,
        sender: memberPayloads.filter(
          (m) => m._id.toString() === message.senderId.toString(),
        ),
        messageText: message.messageText,
        attachmentImage: message.attachmentImage,
        sentAt: message.createdAt,
        status: message.status,
      };
      return payload;
    });

    return messagePayload;
  };
}

export default MessageController;
