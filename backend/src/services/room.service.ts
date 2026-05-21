import { RoomModel } from "../models/RoomModel";
import { generateRoomCode } from "../utils/roomCode";

const DEFAULT_VIDEO_STATE = {
  videoId: "aqz-KE-bpKQ",
  currentTime: 0,
  playState: "paused" as const,
  updatedAt: Date.now(),
};

export class RoomService {
  public static async createRoom(): Promise<{ roomId: string }> {
    let roomId = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (await RoomModel.exists({ roomId })) {
      roomId = generateRoomCode();
      attempts += 1;

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate a unique room code.");
      }
    }

    await RoomModel.create({
      roomId,
      videoState: {
        ...DEFAULT_VIDEO_STATE,
        updatedAt: Date.now(),
      },
    });

    return {
      roomId,
    };
  }

  public static async roomExists(roomId: string): Promise<boolean> {
    const cleanRoomId = roomId.trim().toUpperCase();

    if (!cleanRoomId) {
      return false;
    }

    const roomExists = await RoomModel.exists({
      roomId: cleanRoomId,
    });

    return Boolean(roomExists);
  }
}