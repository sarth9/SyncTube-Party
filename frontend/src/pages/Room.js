import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChatBox } from "../components/ChatBox";
import { ParticipantList } from "../components/ParticipantList";
import { RoomControls } from "../components/RoomControls";
import { YouTubePlayerBox } from "../components/YouTubePlayer";
import { socket } from "../socket/socket";
import { extractYouTubeVideoId } from "../utils/youtube";
const INITIAL_VIDEO_STATE = {
    videoId: "aqz-KE-bpKQ",
    currentTime: 0,
    playState: "paused",
    updatedAt: 0,
};
export function Room() {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const usernameFromUrl = searchParams.get("username") || "";
    const [username, setUsername] = useState(usernameFromUrl);
    const [joinNameInput, setJoinNameInput] = useState("");
    const [currentUserId, setCurrentUserId] = useState("");
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [videoState, setVideoState] = useState(INITIAL_VIDEO_STATE);
    const currentUserRole = useMemo(() => {
        return (participants.find((participant) => participant.userId === currentUserId)
            ?.role || null);
    }, [participants, currentUserId]);
    const canControl = currentUserRole === "HOST" || currentUserRole === "MODERATOR";
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
        socket.on("joined_room", (payload) => {
            setCurrentUserId(payload.userId);
            setParticipants(payload.room.participants);
            setVideoState(payload.room.videoState);
        });
        socket.on("sync_state", (state) => {
            setVideoState(state);
        });
        socket.on("chat_history", (payload) => {
            setMessages(payload.messages);
        });
        socket.on("chat_message", (message) => {
            setMessages((currentMessages) => [...currentMessages, message]);
        });
        socket.on("user_joined", (payload) => {
            setParticipants(payload.participants);
        });
        socket.on("user_left", (payload) => {
            setParticipants(payload.participants);
        });
        socket.on("role_assigned", (payload) => {
            setParticipants(payload.participants);
        });
        socket.on("participant_removed", (payload) => {
            setParticipants(payload.participants);
        });
        socket.on("removed_from_room", (payload) => {
            alert(payload.message);
            navigate("/");
        });
        socket.on("error_message", (payload) => {
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
    function handleJoinWithName(event) {
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
    function handleChangeVideo(input) {
        if (!roomId)
            return;
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
    function handleAssignRole(userId, role) {
        if (!roomId)
            return;
        socket.emit("assign_role", {
            roomId,
            userId,
            role,
        });
    }
    function handleRemoveParticipant(userId) {
        if (!roomId)
            return;
        socket.emit("remove_participant", {
            roomId,
            userId,
        });
    }
    function handleSendMessage(message) {
        if (!roomId)
            return;
        socket.emit("send_message", {
            roomId,
            message,
        });
    }
    async function handleCopyLink() {
        if (!roomId)
            return;
        const cleanRoomLink = `${window.location.origin}/room/${roomId}`;
        await navigator.clipboard.writeText(cleanRoomLink);
        alert("Clean room link copied. Participant will enter their own name.");
    }
    if (!username.trim()) {
        return (_jsx("main", { className: "min-h-screen px-5 py-8", children: _jsx("section", { className: "mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center", children: _jsxs("div", { className: "w-full rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur md:p-8", children: [_jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Home"] }), _jsxs("div", { className: "mb-6 flex items-start gap-4", children: [_jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white", children: _jsx(UserRound, { className: "h-6 w-6" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-black text-slate-950", children: "Join Watch Room" }), _jsxs("p", { className: "mt-2 text-slate-500", children: ["Room code:", " ", _jsx("span", { className: "font-bold text-slate-900", children: roomId })] })] })] }), _jsxs("form", { onSubmit: handleJoinWithName, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Your Name" }), _jsx("input", { value: joinNameInput, onChange: (event) => setJoinNameInput(event.target.value), placeholder: "Enter your name", className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4", autoFocus: true })] }), _jsx("button", { className: "w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-200 hover:opacity-90", children: "Join Room" })] })] }) }) }));
    }
    return (_jsx("main", { className: "min-h-screen px-5 py-6", children: _jsxs("section", { className: "mx-auto max-w-7xl", children: [_jsx("div", { className: "mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center", children: _jsxs("div", { children: [_jsxs(Link, { to: "/", className: "mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Home"] }), _jsxs("h1", { className: "text-3xl font-black text-slate-950", children: ["Watch Room Code: ", roomId] }), _jsxs("p", { className: "mt-1 text-sm text-slate-500", children: ["Logged in as ", _jsx("span", { className: "font-bold", children: username }), ". Your role is", " ", _jsx("span", { className: "font-bold", children: currentUserRole || "..." }), "."] })] }) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[1fr_380px]", children: [_jsxs("div", { className: "space-y-6", children: [_jsx(YouTubePlayerBox, { videoState: videoState, canControl: canControl, onNativePlay: (currentTime) => {
                                        if (!roomId)
                                            return;
                                        socket.emit("play", {
                                            roomId,
                                            currentTime,
                                        });
                                    }, onNativePause: (currentTime) => {
                                        if (!roomId)
                                            return;
                                        socket.emit("pause", {
                                            roomId,
                                            currentTime,
                                        });
                                    }, onNativeSeek: (currentTime, playState) => {
                                        if (!roomId)
                                            return;
                                        socket.emit("seek", {
                                            roomId,
                                            time: currentTime,
                                            playState,
                                        });
                                    } }), _jsx(RoomControls, { canControl: canControl, onChangeVideo: handleChangeVideo, onCopyLink: handleCopyLink })] }), _jsxs("div", { className: "space-y-6", children: [_jsx(ParticipantList, { participants: participants, currentUserId: currentUserId, currentUserRole: currentUserRole, onAssignRole: handleAssignRole, onRemoveParticipant: handleRemoveParticipant }), _jsx(ChatBox, { messages: messages, currentUserId: currentUserId, onSendMessage: handleSendMessage })] })] })] }) }));
}
