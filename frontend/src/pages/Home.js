import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import axios from "axios";
import { Clapperboard, Sparkles, UsersRound, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export function Home() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    async function handleCreateRoom() {
        if (!username.trim()) {
            alert("Please enter your name first.");
            return;
        }
        try {
            setIsCreating(true);
            const response = await axios.post(`${API_BASE_URL}/api/rooms`);
            navigate(`/room/${response.data.roomId}?username=${encodeURIComponent(username.trim())}`);
        }
        catch {
            alert("Failed to create room. Please check backend server.");
        }
        finally {
            setIsCreating(false);
        }
    }
    async function handleJoinRoom(event) {
        event.preventDefault();
        if (!username.trim() || !roomCode.trim()) {
            alert("Please enter your name and room code.");
            return;
        }
        try {
            setIsJoining(true);
            const cleanRoomCode = roomCode.trim().toUpperCase();
            const response = await axios.get(`${API_BASE_URL}/api/rooms/${cleanRoomCode}/exists`);
            if (!response.data.exists) {
                alert("Room not found. Please check the room code.");
                return;
            }
            navigate(`/room/${cleanRoomCode}?username=${encodeURIComponent(username.trim())}`);
        }
        catch {
            alert("Failed to join room. Please check backend server.");
        }
        finally {
            setIsJoining(false);
        }
    }
    return (_jsx("main", { className: "min-h-screen px-5 py-8", children: _jsx("section", { className: "mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center", children: _jsxs("div", { className: "grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-6 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm", children: [_jsx(Sparkles, { className: "h-4 w-4" }), "Real-time YouTube Watch Party"] }), _jsx("h1", { className: "max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl", children: "Watch YouTube together, perfectly in sync." }), _jsx("p", { className: "mt-6 max-w-2xl text-lg leading-8 text-slate-600", children: "Create a room, invite friends, assign roles, chat live, and synchronize YouTube playback using WebSockets." }), _jsxs("div", { className: "mt-8 grid max-w-2xl gap-4 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm", children: [_jsx(Video, { className: "mb-3 h-6 w-6 text-purple-600" }), _jsx("p", { className: "font-bold", children: "YouTube Sync" }), _jsx("p", { className: "text-sm text-slate-500", children: "Shared playback state" })] }), _jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm", children: [_jsx(UsersRound, { className: "mb-3 h-6 w-6 text-pink-600" }), _jsx("p", { className: "font-bold", children: "Rooms" }), _jsx("p", { className: "text-sm text-slate-500", children: "Create or join links" })] }), _jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm", children: [_jsx(Clapperboard, { className: "mb-3 h-6 w-6 text-slate-800" }), _jsx("p", { className: "font-bold", children: "RBAC" }), _jsx("p", { className: "text-sm text-slate-500", children: "Host and Moderator" })] })] })] }), _jsxs("div", { className: "rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur", children: [_jsx("h2", { className: "text-2xl font-black text-slate-950", children: "Start a Watch Party" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Enter your name, create a room, or join an existing room." }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Your Name" }), _jsx("input", { value: username, onChange: (event) => setUsername(event.target.value), placeholder: "e.g. Sarth", className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4" })] }), _jsx("button", { onClick: handleCreateRoom, disabled: isCreating, type: "button", className: "mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:opacity-90", children: isCreating ? "Creating Room..." : "Create New Room" }), _jsxs("div", { className: "my-6 flex items-center gap-3", children: [_jsx("div", { className: "h-px flex-1 bg-slate-200" }), _jsx("span", { className: "text-xs font-bold uppercase tracking-widest text-slate-400", children: "or" }), _jsx("div", { className: "h-px flex-1 bg-slate-200" })] }), _jsxs("form", { onSubmit: handleJoinRoom, children: [_jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Room Code" }), _jsx("input", { value: roomCode, onChange: (event) => setRoomCode(event.target.value), placeholder: "Enter room code", className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none ring-purple-200 focus:ring-4" }), _jsx("button", { disabled: isJoining, className: "mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white hover:bg-slate-800", type: "submit", children: isJoining ? "Checking Room..." : "Join Room" })] })] })] }) }) }));
}
