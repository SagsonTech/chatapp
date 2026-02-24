import mongoose, { InferSchemaType } from "mongoose";

const messageStatus = ["waiting", "sent", "read", "deleted"] as const;

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageText: {
      type: String,
      default: "",
    },

    attachmentImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: messageStatus,
      default: "waiting",
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
export type MessageType = InferSchemaType<typeof messageSchema>;
const Message = mongoose.model("Message", messageSchema);

export default Message;
