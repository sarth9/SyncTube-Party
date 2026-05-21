export type Role = "HOST" | "MODERATOR" | "PARTICIPANT";

export type PlayState = "playing" | "paused";

export interface VideoState {
  videoId: string;
  currentTime: number;
  playState: PlayState;
  updatedAt: number;
}

export interface ParticipantDTO {
  userId: string;
  username: string;
  role: Role;
}

export interface RoomDTO {
  roomId: string;
  participants: ParticipantDTO[];
  videoState: VideoState;
}

export interface ChatMessageDTO {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface JoinRoomPayload {
  roomId: string;
  username: string;
}

export interface ChangeVideoPayload {
  roomId: string;
  videoId: string;
}

export interface SeekPayload {
  roomId: string;
  time: number;
  playState?: PlayState;
}

export interface AssignRolePayload {
  roomId: string;
  userId: string;
  role: Role;
}

export interface RemoveParticipantPayload {
  roomId: string;
  userId: string;
}

export interface SendMessagePayload {
  roomId: string;
  message: string;
}