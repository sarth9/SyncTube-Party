import type { NextFunction, Request, Response } from "express";
import { RoomService } from "../services/room.service";

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}

export class RoomController {
  public static async createRoom(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const room = await RoomService.createRoom();

      res.status(201).json({
        success: true,
        roomId: room.roomId,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async checkRoomExists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rawRoomId = getSingleParam(req.params.roomId);
      const roomId = rawRoomId.trim().toUpperCase();

      if (!roomId) {
        res.status(400).json({
          success: false,
          message: "Room ID is required.",
        });
        return;
      }

      const exists = await RoomService.roomExists(roomId);

      res.status(200).json({
        success: true,
        exists,
      });
    } catch (error) {
      next(error);
    }
  }
}