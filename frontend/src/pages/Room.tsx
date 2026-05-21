import { ArrowLeft, Radio, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChatBox } from "../components/ChatBox";
import { ParticipantList } from "../components/ParticipantList";
import { RoomControls } from "../components/RoomControls";
import { YouTubePlayerBox } from "../components/YouTubePlayer";
import { socket } from "../socket/socket";
import type {
  ChatMessage,
  JoinedRoomResponse,
  Participant,
  PlayState,
  Role,
  VideoState,
} from "../types";
import { extractYouTubeVideoId } from "../utils/youtube";

const INITIAL_VIDEO_STATE: VideoState = {
  videoId: "aqz-KE-bpKQ",
  currentTime: 0,
  playState: "paused",
  updatedAt: 0,
};

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const usernameFromUrl = searchParams.get("username") || "";
  const [username, setUsername] = useState(usernameFromUrl);
  const [joinNameInput, setJoinNameInput] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [videoState, setVideoState] =
    useState<VideoState>(INITIAL_VIDEO_STATE);

  const currentUserRole = useMemo<Role | null>(() => {
    return (
      participants.find((participant) => participant.userId === currentUserId)
        ?.role || null
    );
  }, [participants, currentUserId]);

  const canControl =
    currentUserRole === "HOST" || currentUserRole === "MODERATOR";

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    if (!username.trim()) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", {
      roomId,
      username: username.trim(),
    });

    socket.on("joined_room", (payload: JoinedRoomResponse) => {
      setCurrentUserId(payload.userId);
      setParticipants(payload.room.participants);
      setVideoState(payload.room.videoState);
    });

    socket.on("sync_state", (state: VideoState) => {
      setVideoState(state);
    });

    socket.on("chat_history", (payload: { messages: ChatMessage[] }) => {
      setMessages(payload.messages);
    });

    socket.on("chat_message", (message: ChatMessage) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    });

    socket.on("user_joined", (payload: { participants: Participant[] }) => {
      setParticipants(payload.participants);
    });

    socket.on("user_left", (payload: { participants: Participant[] }) => {
      setParticipants(payload.participants);
    });

    socket.on("role_assigned", (payload: { participants: Participant[] }) => {
      setParticipants(payload.participants);
    });

    socket.on(
      "participant_removed",
      (payload: { participants: Participant[] }) => {
        setParticipants(payload.participants);
      }
    );

    socket.on("removed_from_room", (payload: { message: string }) => {
      alert(payload.message);
      navigate("/");
    });

    socket.on("error_message", (payload: { message: string }) => {
      alert(payload.message);
    });

    return () => {
      socket.off("joined_room");
      socket.off("sync_state");
      socket.off("chat_history");
      socket.off("chat_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("role_assigned");
      socket.off("participant_removed");
      socket.off("removed_from_room");
      socket.off("error_message");
      socket.disconnect();
    };
  }, [roomId, username, navigate]);

  function handleJoinWithName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = joinNameInput.trim();

    if (!cleanName) {
      alert("Please enter your name.");
      return;
    }

    setUsername(cleanName);

    if (roomId) {
      navigate(`/room/${roomId}?username=${encodeURIComponent(cleanName)}`, {
        replace: true,
      });
    }
  }

  function handleChangeVideo(input: string) {
    if (!roomId) return;

    const videoId = extractYouTubeVideoId(input);

    if (!videoId) {
      alert("Please enter a valid YouTube URL or video ID.");
      return;
    }

    socket.emit("change_video", {
      roomId,
      videoId,
    });
  }

  function handleAssignRole(userId: string, role: Role) {
    if (!roomId) return;

    socket.emit("assign_role", {
      roomId,
      userId,
      role,
    });
  }

  function handleRemoveParticipant(userId: string) {
    if (!roomId) return;

    socket.emit("remove_participant", {
      roomId,
      userId,
    });
  }

  function handleSendMessage(message: string) {
    if (!roomId) return;

    socket.emit("send_message", {
      roomId,
      message,
    });
  }

  async function handleCopyLink() {
    if (!roomId) return;

    const cleanRoomLink = `${window.location.origin}/room/${roomId}`;

    await navigator.clipboard.writeText(cleanRoomLink);
    alert("Clean room link copied. Participant will enter their own name.");
  }

  if (!username.trim()) {
    return (
      <main className="min-h-screen px-5 py-8">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <UserRound className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-black text-slate-950">
                  Join Watch Room
                </h1>
                <p className="mt-2 text-slate-500">
                  Room code:{" "}
                  <span className="font-bold text-slate-900">{roomId}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinWithName} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Your Name
                </label>

                <input
                  value={joinNameInput}
                  onChange={(event) => setJoinNameInput(event.target.value)}
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4"
                  autoFocus
                />
              </div>

              <button className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:opacity-90">
                Join Room
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center">
          <div>
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-3xl font-black text-slate-950">
              Watch Room Code: {roomId}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Logged in as <span className="font-bold">{username}</span>. Your
              role is{" "}
              <span className="font-bold">{currentUserRole || "..."}</span>.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <YouTubePlayerBox
              videoState={videoState}
              canControl={canControl}
              onNativePlay={(currentTime) => {
                if (!roomId) return;

                socket.emit("play", {
                  roomId,
                  currentTime,
                });
              }}
              onNativePause={(currentTime) => {
                if (!roomId) return;

                socket.emit("pause", {
                  roomId,
                  currentTime,
                });
              }}
              onNativeSeek={(currentTime, playState: PlayState) => {
                if (!roomId) return;

                socket.emit("seek", {
                  roomId,
                  time: currentTime,
                  playState,
                });
              }}
            />

            <RoomControls
              canControl={canControl}
              onChangeVideo={handleChangeVideo}
              onCopyLink={handleCopyLink}
            />
          </div>

          <div className="space-y-6">
            <ParticipantList
              participants={participants}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onAssignRole={handleAssignRole}
              onRemoveParticipant={handleRemoveParticipant}
            />

            <ChatBox
              messages={messages}
              currentUserId={currentUserId}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}