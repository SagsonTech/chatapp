import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    friends: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isBlocked: {
          type: Boolean,
          default: false,
        },
        friendsFrom: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true },
);

export type userType = InferSchemaType<typeof userSchema>;

const User = mongoose.model("User", userSchema);

export default User;
