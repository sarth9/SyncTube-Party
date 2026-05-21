import { Router } from "express";
import { RoomController } from "../controllers/room.controller";

const router = Router();

router.post("/", RoomController.createRoom);
router.get("/:roomId/exists", RoomController.checkRoomExists);

export default router;