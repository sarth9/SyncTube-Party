import { Room } from "./Room";
import type { VideoState } from "../types";

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  public createRoom(roomId: string, initialVideoState?: VideoState): Room {
    const normalizedRoomId = roomId.trim().toUpperCase();

    if (this.rooms.has(normalizedRoomId)) {
      throw new Error("Room already exists.");
    }

    const room = new Room(normalizedRoomId, initialVideoState);
    this.rooms.set(normalizedRoomId, room);

    return room;
  }

  public getRoom(roomId: string): Room | undefined {
    const normalizedRoomId = roomId.trim().toUpperCase();
    return this.rooms.get(normalizedRoomId);
  }

  public getOrCreateRoom(
    roomId: string,
    initialVideoState?: VideoState
  ): Room {
    const normalizedRoomId = roomId.trim().toUpperCase();

    const existingRoom = this.rooms.get(normalizedRoomId);

    if (existingRoom) {
      return existingRoom;
    }

    return this.createRoom(normalizedRoomId, initialVideoState);
  }

  public deleteRoom(roomId: string): void {
    const normalizedRoomId = roomId.trim().toUpperCase();
    this.rooms.delete(normalizedRoomId);
  }
}

export const roomManager = new RoomManager();