import { Server, Socket } from "socket.io";
import { roomManager } from "../classes/RoomManager";
import { ChatMessageModel } from "../models/ChatMessageModel";
import { RoomModel } from "../models/RoomModel";
import type {
  AssignRolePayload,
  ChangeVideoPayload,
  ChatMessageDTO,
  JoinRoomPayload,
  PlayState,
  RemoveParticipantPayload,
  SeekPayload,
  SendMessagePayload,
  VideoState,
} from "../types";

function emitError(socket: Socket, message: string): void {
  socket.emit("error_message", { message });
}

function getSafeTime(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  return fallback;
}

function getSafePlayState(value: unknown, fallback: PlayState): PlayState {
  if (value === "playing" || value === "paused") {
    return value;
  }

  return fallback;
}

function serializeChatMessage(message: {
  _id: unknown;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}): ChatMessageDTO {
  return {
    id: String(message._id),
    roomId: message.roomId,
    userId: message.userId,
    username: message.username,
    message: message.message,
    createdAt: message.createdAt.toISOString(),
  };
}

async function persistRoomState(
  roomId: string,
  videoState: VideoState
): Promise<void> {
  await RoomModel.updateOne(
    { roomId },
    {
      $set: {
        videoState,
      },
    }
  );
}

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_room", async (payload: JoinRoomPayload) => {
      try {
        const { roomId, username } = payload;
        const cleanRoomId = roomId?.trim().toUpperCase();
        const cleanUsername = username?.trim();

        if (!cleanRoomId || !cleanUsername) {
          emitError(socket, "Room ID and username are required.");
          return;
        }

        const roomDocument = await RoomModel.findOne({
          roomId: cleanRoomId,
        });

        if (!roomDocument) {
          emitError(socket, "Room not found. Please check the room link.");
          return;
        }

        const room = roomManager.getOrCreateRoom(
          cleanRoomId,
          roomDocument.videoState
        );

        const participant = room.addParticipant(socket.id, cleanUsername);

        socket.join(cleanRoomId);
        socket.data.roomId = cleanRoomId;
        socket.data.username = cleanUsername;

        const recentMessages = await ChatMessageModel.find({
          roomId: cleanRoomId,
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        const chatHistory = recentMessages
          .reverse()
          .map((message) =>
            serializeChatMessage({
              _id: message._id,
              roomId: message.roomId,
              userId: message.userId,
              username: message.username,
              message: message.message,
              createdAt: message.createdAt,
            })
          );

        socket.emit("joined_room", {
          userId: socket.id,
          room: room.toDTO(),
        });

        socket.emit("chat_history", {
          messages: chatHistory,
        });

        io.to(cleanRoomId).emit("user_joined", {
          username: participant.username,
          userId: participant.userId,
          role: participant.role,
          participants: room.getParticipants(),
        });

        socket.emit("sync_state", room.getVideoState());
      } catch (error) {
        console.error("join_room error:", error);

        emitError(
          socket,
          error instanceof Error ? error.message : "Failed to join room."
        );
      }
    });

    socket.on(
      "play",
      async ({
        roomId,
        currentTime,
      }: {
        roomId: string;
        currentTime?: number;
      }) => {
        try {
          const room = roomManager.getRoom(roomId);

          if (!room) {
            emitError(socket, "Room not found.");
            return;
          }

          if (!room.canControlPlayback(socket.id)) {
            emitError(socket, "You do not have permission to play this video.");
            return;
          }

          const existingState = room.getVideoState();

          const videoState = room.updateVideoState({
            playState: "playing",
            currentTime: getSafeTime(currentTime, existingState.currentTime),
          });

          await persistRoomState(roomId, videoState);

          io.to(roomId).emit("sync_state", videoState);
        } catch (error) {
          console.error("play error:", error);
          emitError(socket, "Failed to play video.");
        }
      }
    );

    socket.on(
      "pause",
      async ({
        roomId,
        currentTime,
      }: {
        roomId: string;
        currentTime?: number;
      }) => {
        try {
          const room = roomManager.getRoom(roomId);

          if (!room) {
            emitError(socket, "Room not found.");
            return;
          }

          if (!room.canControlPlayback(socket.id)) {
            emitError(socket, "You do not have permission to pause this video.");
            return;
          }

          const existingState = room.getVideoState();

          const videoState = room.updateVideoState({
            playState: "paused",
            currentTime: getSafeTime(currentTime, existingState.currentTime),
          });

          await persistRoomState(roomId, videoState);

          io.to(roomId).emit("sync_state", videoState);
        } catch (error) {
          console.error("pause error:", error);
          emitError(socket, "Failed to pause video.");
        }
      }
    );

    socket.on("seek", async (payload: SeekPayload) => {
      try {
        const { roomId, time, playState } = payload;
        const room = roomManager.getRoom(roomId);

        if (!room) {
          emitError(socket, "Room not found.");
          return;
        }

        if (!room.canControlPlayback(socket.id)) {
          emitError(socket, "You do not have permission to seek this video.");
          return;
        }

        if (typeof time !== "number" || !Number.isFinite(time) || time < 0) {
          emitError(socket, "Invalid seek time.");
          return;
        }

        const existingState = room.getVideoState();

        const videoState = room.updateVideoState({
          currentTime: time,
          playState: getSafePlayState(playState, existingState.playState),
        });

        await persistRoomState(roomId, videoState);

        io.to(roomId).emit("sync_state", videoState);
      } catch (error) {
        console.error("seek error:", error);
        emitError(socket, "Failed to seek video.");
      }
    });

    socket.on("change_video", async (payload: ChangeVideoPayload) => {
      try {
        const { roomId, videoId } = payload;
        const room = roomManager.getRoom(roomId);

        if (!room) {
          emitError(socket, "Room not found.");
          return;
        }

        if (!room.canControlPlayback(socket.id)) {
          emitError(
            socket,
            "You do not have permission to change this video."
          );
          return;
        }

        if (!videoId || videoId.length !== 11) {
          emitError(socket, "Invalid YouTube video ID.");
          return;
        }

        const videoState = room.updateVideoState({
          videoId,
          currentTime: 0,
          playState: "paused",
        });

        await persistRoomState(roomId, videoState);

        io.to(roomId).emit("sync_state", videoState);
      } catch (error) {
        console.error("change_video error:", error);
        emitError(socket, "Failed to change video.");
      }
    });

    socket.on("assign_role", (payload: AssignRolePayload) => {
      const { roomId, userId, role } = payload;
      const room = roomManager.getRoom(roomId);

      if (!room) {
        emitError(socket, "Room not found.");
        return;
      }

      if (!room.isHost(socket.id)) {
        emitError(socket, "Only the host can assign roles.");
        return;
      }

      if (!["HOST", "MODERATOR", "PARTICIPANT"].includes(role)) {
        emitError(socket, "Invalid role.");
        return;
      }

      const participant = room.assignRole(userId, role);

      io.to(roomId).emit("role_assigned", {
        userId: participant.userId,
        username: participant.username,
        role: participant.role,
        participants: room.getParticipants(),
      });
    });

    socket.on("remove_participant", (payload: RemoveParticipantPayload) => {
      const { roomId, userId } = payload;
      const room = roomManager.getRoom(roomId);

      if (!room) {
        emitError(socket, "Room not found.");
        return;
      }

      if (!room.isHost(socket.id)) {
        emitError(socket, "Only the host can remove participants.");
        return;
      }

      if (socket.id === userId) {
        emitError(socket, "Host cannot remove themselves.");
        return;
      }

      const targetSocket = io.sockets.sockets.get(userId);

      room.removeParticipant(userId);

      if (targetSocket) {
        targetSocket.emit("removed_from_room", {
          message: "You were removed from the room by the host.",
        });

        targetSocket.leave(roomId);
      }

      io.to(roomId).emit("participant_removed", {
        userId,
        participants: room.getParticipants(),
      });
    });

    socket.on("send_message", async (payload: SendMessagePayload) => {
      try {
        const { roomId, message } = payload;
        const cleanRoomId = roomId?.trim().toUpperCase();
        const cleanMessage = message?.trim();

        if (!cleanRoomId || !cleanMessage) {
          emitError(socket, "Message cannot be empty.");
          return;
        }

        if (cleanMessage.length > 500) {
          emitError(socket, "Message must be 500 characters or less.");
          return;
        }

        const room = roomManager.getRoom(cleanRoomId);

        if (!room) {
          emitError(socket, "Room not found.");
          return;
        }

        const participant = room.getParticipant(socket.id);

        if (!participant) {
          emitError(socket, "You must join the room before sending messages.");
          return;
        }

        const createdMessage = await ChatMessageModel.create({
          roomId: cleanRoomId,
          userId: socket.id,
          username: participant.username,
          message: cleanMessage,
        });

        const chatMessage = serializeChatMessage({
          _id: createdMessage._id,
          roomId: createdMessage.roomId,
          userId: createdMessage.userId,
          username: createdMessage.username,
          message: createdMessage.message,
          createdAt: createdMessage.createdAt,
        });

        io.to(cleanRoomId).emit("chat_message", chatMessage);
      } catch (error) {
        console.error("send_message error:", error);
        emitError(socket, "Failed to send message.");
      }
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId as string | undefined;
      const username = socket.data.username as string | undefined;

      if (!roomId) {
        return;
      }

      const room = roomManager.getRoom(roomId);

      if (!room) {
        return;
      }

      room.removeParticipant(socket.id);

      if (room.isEmpty()) {
        roomManager.deleteRoom(roomId);
        return;
      }

      io.to(roomId).emit("user_left", {
        username,
        userId: socket.id,
        participants: room.getParticipants(),
      });
    });
  });
}