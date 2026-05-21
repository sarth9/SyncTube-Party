import mongoose, { Schema } from "mongoose";

interface ChatMessageDocument {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<ChatMessageDocument>(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessageModel = mongoose.model<ChatMessageDocument>(
  "ChatMessage",
  chatMessageSchema
);