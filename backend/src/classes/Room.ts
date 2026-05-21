import { Participant } from "./Participant";
import type { ParticipantDTO, Role, RoomDTO, VideoState } from "../types";

const DEFAULT_VIDEO_STATE: VideoState = {
  videoId: "aqz-KE-bpKQ",
  currentTime: 0,
  playState: "paused",
  updatedAt: Date.now(),
};

export class Room {
  public readonly roomId: string;
  private participants: Map<string, Participant>;
  private videoState: VideoState;

  constructor(roomId: string, initialVideoState?: VideoState) {
    this.roomId = roomId;
    this.participants = new Map();
    this.videoState = initialVideoState || DEFAULT_VIDEO_STATE;
  }

  public addParticipant(userId: string, username: string): Participant {
    const existingParticipant = this.participants.get(userId);

    if (existingParticipant) {
      existingParticipant.username = username;
      return existingParticipant;
    }

    const hasHost = Array.from(this.participants.values()).some(
      (participant) => participant.role === "HOST"
    );

    const role: Role = hasHost ? "PARTICIPANT" : "HOST";

    const participant = new Participant(userId, username, role);
    this.participants.set(userId, participant);

    return participant;
  }

  public removeParticipant(userId: string): void {
    this.participants.delete(userId);

    const hasHost = Array.from(this.participants.values()).some(
      (participant) => participant.role === "HOST"
    );

    if (!hasHost && this.participants.size > 0) {
      const firstParticipant = Array.from(this.participants.values())[0];
      firstParticipant.role = "HOST";
    }
  }

  public getParticipant(userId: string): Participant | undefined {
    return this.participants.get(userId);
  }

  public getParticipants(): ParticipantDTO[] {
    return Array.from(this.participants.values()).map((participant) =>
      participant.toDTO()
    );
  }

  public assignRole(userId: string, role: Role): Participant {
    const participant = this.participants.get(userId);

    if (!participant) {
      throw new Error("Participant not found.");
    }

    if (role === "HOST") {
      this.participants.forEach((roomParticipant) => {
        if (roomParticipant.role === "HOST") {
          roomParticipant.role = "PARTICIPANT";
        }
      });
    }

    participant.role = role;
    return participant;
  }

  public canControlPlayback(userId: string): boolean {
    const participant = this.participants.get(userId);

    if (!participant) {
      return false;
    }

    return participant.role === "HOST" || participant.role === "MODERATOR";
  }

  public isHost(userId: string): boolean {
    const participant = this.participants.get(userId);
    return participant?.role === "HOST";
  }

  public updateVideoState(partialState: Partial<VideoState>): VideoState {
    this.videoState = {
      ...this.getVideoState(),
      ...partialState,
      updatedAt: Date.now(),
    };

    return this.getVideoState();
  }

  public getVideoState(): VideoState {
    if (this.videoState.playState !== "playing") {
      return this.videoState;
    }

    const elapsedSeconds = (Date.now() - this.videoState.updatedAt) / 1000;

    return {
      ...this.videoState,
      currentTime: this.videoState.currentTime + elapsedSeconds,
    };
  }

  public isEmpty(): boolean {
    return this.participants.size === 0;
  }

  public toDTO(): RoomDTO {
    return {
      roomId: this.roomId,
      participants: this.getParticipants(),
      videoState: this.getVideoState(),
    };
  }
}