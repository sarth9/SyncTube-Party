import type { ParticipantDTO, Role } from "../types";

export class Participant {
  public readonly userId: string;
  public username: string;
  public role: Role;

  constructor(userId: string, username: string, role: Role) {
    this.userId = userId;
    this.username = username;
    this.role = role;
  }

  public toDTO(): ParticipantDTO {
    return {
      userId: this.userId,
      username: this.username,
      role: this.role,
    };
  }
}