export type Role = "HOST" | "MODERATOR" | "PARTICIPANT";

export type PlayState = "playing" | "paused";

export interface Participant {
  userId: string;
  username: string;
  role: Role;
}

export interface VideoState {
  videoId: string;
  currentTime: number;
  playState: PlayState;
  updatedAt: number;
}

export interface RoomData {
  roomId: string;
  participants: Participant[];
  videoState: VideoState;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface JoinedRoomResponse {
  userId: string;
  room: RoomData;
}