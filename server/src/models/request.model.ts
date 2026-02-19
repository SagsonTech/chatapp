import mongoose from "mongoose";

const requestStatusEnum = ["pending", "accepted", "declined", "cancelled"];

const requestSchema = new mongoose.Schema(
  {
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: requestStatusEnum,
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Request = mongoose.model("Request", requestSchema);
