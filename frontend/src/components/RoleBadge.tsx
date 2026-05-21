import type { Role } from "../types";

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles: Record<Role, string> = {
    HOST: "bg-purple-100 text-purple-700 border-purple-200",
    MODERATOR: "bg-pink-100 text-pink-700 border-pink-200",
    PARTICIPANT: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[role]}`}
    >
      {role}
    </span>
  );
}