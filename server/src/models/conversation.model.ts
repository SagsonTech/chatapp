import mongoose, { InferSchemaType } from "mongoose";

const conversationTypeEnum = ["direct", "group"] as const;

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: function (value: mongoose.Types.ObjectId[]) {
          if (this.conversationType === "direct") {
            return value.length === 2;
          }
          return value.length >= 2;
        },
        message: "Invalid number of members for conversation type",
      },
    },

    conversationType: {
      type: String,
      enum: conversationTypeEnum,
      default: "direct",
    },

    directKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
    },

    groupName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export type ConversationType = InferSchemaType<typeof conversationSchema>;

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
