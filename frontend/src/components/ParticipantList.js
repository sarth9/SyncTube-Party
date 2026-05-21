import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Crown, Shield, User, UserMinus } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
export function ParticipantList({ participants, currentUserId, currentUserRole, onAssignRole, onRemoveParticipant, }) {
    const isCurrentUserHost = currentUserRole === "HOST";
    function getIcon(role) {
        if (role === "HOST") {
            return _jsx(Crown, { className: "h-4 w-4 text-purple-600" });
        }
        if (role === "MODERATOR") {
            return _jsx(Shield, { className: "h-4 w-4 text-pink-600" });
        }
        return _jsx(User, { className: "h-4 w-4 text-slate-500" });
    }
    return (_jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-slate-950", children: "Participants" }), _jsx("p", { className: "text-sm text-slate-500", children: "Host can manage roles and remove users." })] }), _jsxs("div", { className: "space-y-3", children: [participants.length === 0 && (_jsx("div", { className: "rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400", children: "Waiting for participants..." })), participants.map((participant) => {
                        const isSelf = participant.userId === currentUserId;
                        const canManageUser = isCurrentUserHost && !isSelf && participant.role !== "HOST";
                        return (_jsxs("div", { className: "rounded-2xl border border-slate-100 bg-slate-50 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm", children: getIcon(participant.role) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "truncate font-semibold text-slate-900", children: [participant.username, " ", isSelf && "(You)"] }), _jsx("div", { className: "mt-1", children: _jsx(RoleBadge, { role: participant.role }) })] })] }), canManageUser && (_jsx("button", { onClick: () => onRemoveParticipant(participant.userId), className: "rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100", title: "Remove participant", type: "button", children: _jsx(UserMinus, { className: "h-4 w-4" }) }))] }), canManageUser && (_jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [_jsx("button", { type: "button", onClick: () => onAssignRole(participant.userId, "PARTICIPANT"), className: "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100", children: "Participant" }), _jsx("button", { type: "button", onClick: () => onAssignRole(participant.userId, "MODERATOR"), className: "rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800", children: "Moderator" })] }))] }, participant.userId));
                    })] })] }));
}
