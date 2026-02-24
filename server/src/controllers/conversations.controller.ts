import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler.middleware";
import User from "../models/user.model";
import Conversation, { ConversationType } from "../models/conversation.model";
import asyncErrorHandlerMiddleware from "../middlewares/asyncErrorHandler.middleware";

class ConversationsController {
  public createOrGetConversation = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { targetUserId } = req.body;
      if (!targetUserId)
        throw new AppError("The target user ID was not provided", 400);

      const userId = (req as any).userId;
      const user = await User.findById(userId);
      if (!user) throw new AppError("User not found", 404);

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new AppError("Target user not found", 404);

      const directConversationKey = this.createDirectConversationKey(
        userId,
        targetUserId,
      );
      try {
        const newConversation = await Conversation.create({
          members: [userId, targetUserId],
          conversationType: "direct",
          directKey: directConversationKey,
        });
        const newConversationPayload = await this.createConversationPayload(
          newConversation,
          newConversation._id.toString(),
          userId,
        );

        return res.status(200).json({
          message: `You have started a new conversation with ${targetUser.username}`,
          conversation: newConversationPayload,
          success: true,
        });
      } catch (err: any) {
        if (err.code === 11000) {
          const existingConversation = await Conversation.findOne({
            directKey: directConversationKey,
          });
          if (!existingConversation)
            throw new AppError("No such conversation found", 404);
          const existingConversationPayload =
            await this.createConversationPayload(
              existingConversation,
              existingConversation._id.toString(),
              userId,
            );
          return res.status(200).json({
            conversation: existingConversationPayload,
            success: true,
          });
        }
      }
    },
  );

  public getConverstions = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const userId = (req as any).userId;

      const conversations = await Conversation.find({
        members: userId,
      })
        .sort({ lastMessageAt: -1 })
        .lean();

      const conversationsPayload = await Promise.all(
        conversations.map(async (conversation) => {
          return await this.createConversationPayload(
            conversation,
            conversation._id.toString(),
            userId,
          );
        }),
      );

      res.status(200).json({
        conversations: conversationsPayload,
        success: true,
      });
    },
  );

  public getConversationById = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const userId = (req as any).userId;
      const { conversationId } = req.params;
      if (!conversationId)
        throw new AppError("Conversation ID was not provided", 404);

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new AppError("Conversation not found", 404);

      if (
        !conversation.members.some((member) => member._id.toString() === userId)
      )
        throw new AppError("Access Denied", 401);

      const conversationPayload = await this.createConversationPayload(
        conversation,
        conversation._id.toString(),
        userId,
      );

      res.status(200).json({
        conversation: conversationPayload,
        success: true,
      });
    },
  );

  private createConversationPayload = async (
    conversation: ConversationType,
    id: string,
    userId: string,
  ) => {
    const conversationPayload = {
      conversationId: id,
      members: await this.getMembersInConversation(conversation, userId),
      conversationType: conversation.conversationType,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    };

    return conversationPayload;
  };

  private getMembersInConversation = async (
    conversation: ConversationType,
    userId: string,
  ) => {
    let memberIds = [];

    for (let i = 0; i < conversation.members.length; i++) {
      if (conversation.members[i]._id.toString() === userId) continue;
      memberIds.push(conversation.members[i]._id);
    }

    const members = await User.find({
      _id: { $in: memberIds },
    })
      .select("-password")
      .select("-friends");

    return members;
  };

  private createDirectConversationKey = (
    userId: string,
    targetUserId: string,
  ): string => {
    const participantIds = [userId, targetUserId];
    participantIds.sort();
    return participantIds[0] + "_" + participantIds[1];
  };
}

export default ConversationsController;
