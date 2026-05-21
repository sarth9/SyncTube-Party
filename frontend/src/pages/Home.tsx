import axios from "axios";
import { Clapperboard, Sparkles, UsersRound, Video } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

      const response = await axios.post<{ success: boolean; roomId: string }>(
        `${API_BASE_URL}/api/rooms`
      );

      navigate(
        `/room/${response.data.roomId}?username=${encodeURIComponent(
          username.trim()
        )}`
      );
    } catch {
      alert("Failed to create room. Please check backend server.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !roomCode.trim()) {
      alert("Please enter your name and room code.");
      return;
    }

    try {
      setIsJoining(true);

      const cleanRoomCode = roomCode.trim().toUpperCase();

      const response = await axios.get<{ success: boolean; exists: boolean }>(
        `${API_BASE_URL}/api/rooms/${cleanRoomCode}/exists`
      );

      if (!response.data.exists) {
        alert("Room not found. Please check the room code.");
        return;
      }

      navigate(
        `/room/${cleanRoomCode}?username=${encodeURIComponent(
          username.trim()
        )}`
      );
    } catch {
      alert("Failed to join room. Please check backend server.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Real-time YouTube Watch Party
            </div>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              Watch YouTube together, perfectly in sync.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Create a room, invite friends, assign roles, chat live, and
              synchronize YouTube playback using WebSockets.
            </p>

            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <Video className="mb-3 h-6 w-6 text-purple-600" />
                <p className="font-bold">YouTube Sync</p>
                <p className="text-sm text-slate-500">Shared playback state</p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <UsersRound className="mb-3 h-6 w-6 text-pink-600" />
                <p className="font-bold">Rooms</p>
                <p className="text-sm text-slate-500">Create or join links</p>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                <Clapperboard className="mb-3 h-6 w-6 text-slate-800" />
                <p className="font-bold">RBAC</p>
                <p className="text-sm text-slate-500">Host and Moderator</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-black text-slate-950">
              Start a Watch Party
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter your name, create a room, or join an existing room.
            </p>

            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">
                Your Name
              </label>

              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. Sarth"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              type="button"
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:opacity-90"
            >
              {isCreating ? "Creating Room..." : "Create New Room"}
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleJoinRoom}>
              <label className="text-sm font-semibold text-slate-700">
                Room Code
              </label>

              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="Enter room code"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 uppercase outline-none ring-purple-200 focus:ring-4"
              />

              <button
                disabled={isJoining}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white hover:bg-slate-800"
                type="submit"
              >
                {isJoining ? "Checking Room..." : "Join Room"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}