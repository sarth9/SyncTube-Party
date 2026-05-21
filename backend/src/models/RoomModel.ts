import mongoose, { Schema } from "mongoose";
import type { VideoState } from "../types";

interface RoomDocument {
  roomId: string;
  videoState: VideoState;
  createdAt: Date;
  updatedAt: Date;
}

const videoStateSchema = new Schema<VideoState>(
  {
    videoId: {
      type: String,
      required: true,
      default: "aqz-KE-bpKQ",
    },
    currentTime: {
      type: Number,
      required: true,
      default: 0,
    },
    playState: {
      type: String,
      enum: ["playing", "paused"],
      required: true,
      default: "paused",
    },
    updatedAt: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    _id: false,
  }
);

const roomSchema = new Schema<RoomDocument>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    videoState: {
      type: videoStateSchema,
      required: true,
      default: () => ({
        videoId: "aqz-KE-bpKQ",
        currentTime: 0,
        playState: "paused",
        updatedAt: Date.now(),
      }),
    },
  },
  {
    timestamps: true,
  }
);

export const RoomModel = mongoose.model<RoomDocument>("Room", roomSchema);