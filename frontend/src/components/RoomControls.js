import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link2, Search, Send } from "lucide-react";
import { useState } from "react";
const TEST_VIDEOS = [
    {
        label: "Big Buck Bunny",
        videoId: "aqz-KE-bpKQ",
    },
    {
        label: "Sintel Trailer",
        videoId: "eRsGyueVLvQ",
    },
    {
        label: "Tears of Steel",
        videoId: "R6MlUcmOul8",
    },
];
export function RoomControls({ canControl, onChangeVideo, onCopyLink, }) {
    const [youtubeInput, setYoutubeInput] = useState("");
    function handleChangeVideo(event) {
        event.preventDefault();
        if (!youtubeInput.trim()) {
            alert("Please paste a YouTube URL or video ID.");
            return;
        }
        onChangeVideo(youtubeInput);
        setYoutubeInput("");
    }
    function loadDemoVideo(videoId) {
        onChangeVideo(videoId);
    }
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "rounded-3xl border border-purple-100 bg-white/90 p-5 shadow-soft backdrop-blur", children: [_jsxs("div", { className: "mb-4 flex items-start gap-3", children: [_jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white", children: _jsx(Search, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black text-slate-950", children: "Choose YouTube Video" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Use YouTube player controls for play, pause, and seek. Use this box only to change the video for everyone." })] })] }), !canControl && (_jsx("div", { className: "mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700", children: "You are a Participant. You can watch only. Ask the Host to promote you to Moderator if you need controls." })), _jsxs("form", { onSubmit: handleChangeVideo, className: "flex flex-col gap-3 md:flex-row", children: [_jsx("input", { disabled: !canControl, value: youtubeInput, onChange: (event) => setYoutubeInput(event.target.value), placeholder: "Paste YouTube URL or 11-character video ID", className: "min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4 disabled:bg-slate-100" }), _jsxs("button", { disabled: !canControl, className: "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-bold text-white hover:opacity-90 disabled:opacity-50", type: "submit", children: [_jsx(Send, { className: "h-4 w-4" }), "Load Video"] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "mb-2 text-xs font-bold uppercase tracking-wider text-slate-400", children: "Quick test videos" }), _jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: TEST_VIDEOS.map((video) => (_jsx("button", { disabled: !canControl, onClick: () => loadDemoVideo(video.videoId), type: "button", className: "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50", children: video.label }, video.videoId))) })] })] }), _jsx("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur", children: _jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-slate-950", children: "Room Link" }), _jsx("p", { className: "text-sm text-slate-500", children: "Share this link with others to join the watch party." })] }), _jsxs("button", { onClick: onCopyLink, type: "button", className: "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: [_jsx(Link2, { className: "h-4 w-4" }), "Copy Room Link"] })] }) })] }));
}
