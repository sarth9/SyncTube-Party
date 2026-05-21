import { Crown, Shield, User, UserMinus } from "lucide-react";
import type { Participant, Role } from "../types";
import { RoleBadge } from "./RoleBadge";

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
  currentUserRole: Role | null;
  onAssignRole: (userId: string, role: Role) => void;
  onRemoveParticipant: (userId: string) => void;
}

export function ParticipantList({
  participants,
  currentUserId,
  currentUserRole,
  onAssignRole,
  onRemoveParticipant,
}: ParticipantListProps) {
  const isCurrentUserHost = currentUserRole === "HOST";

  function getIcon(role: Role) {
    if (role === "HOST") {
      return <Crown className="h-4 w-4 text-purple-600" />;
    }

    if (role === "MODERATOR") {
      return <Shield className="h-4 w-4 text-pink-600" />;
    }

    return <User className="h-4 w-4 text-slate-500" />;
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-950">Participants</h2>
        <p className="text-sm text-slate-500">
          Host can manage roles and remove users.
        </p>
      </div>

      <div className="space-y-3">
        {participants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
            Waiting for participants...
          </div>
        )}

        {participants.map((participant) => {
          const isSelf = participant.userId === currentUserId;
          const canManageUser =
            isCurrentUserHost && !isSelf && participant.role !== "HOST";

          return (
            <div
              key={participant.userId}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {getIcon(participant.role)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {participant.username} {isSelf && "(You)"}
                    </p>

                    <div className="mt-1">
                      <RoleBadge role={participant.role} />
                    </div>
                  </div>
                </div>

                {canManageUser && (
                  <button
                    onClick={() => onRemoveParticipant(participant.userId)}
                    className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    title="Remove participant"
                    type="button"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>

              {canManageUser && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAssignRole(participant.userId, "PARTICIPANT")
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Participant
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onAssignRole(participant.userId, "MODERATOR")
                    }
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Moderator
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}