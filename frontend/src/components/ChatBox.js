import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function ChatBox({ messages, currentUserId, onSendMessage, }) {
    const [messageInput, setMessageInput] = useState("");
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);
    function handleSubmit(event) {
        event.preventDefault();
        const cleanMessage = messageInput.trim();
        if (!cleanMessage) {
            return;
        }
        onSendMessage(cleanMessage);
        setMessageInput("");
    }
    return (_jsxs("div", { className: "rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur", children: [_jsxs("div", { className: "mb-4 flex items-start gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white", children: _jsx(MessageCircle, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-slate-950", children: "Room Chat" }), _jsx("p", { className: "text-sm text-slate-500", children: "Messages are synced live and saved in cloud database." })] })] }), _jsxs("div", { className: "h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3", children: [messages.length === 0 && (_jsx("div", { className: "flex h-full items-center justify-center text-center text-sm text-slate-400", children: "No messages yet. Start the conversation." })), messages.map((message) => {
                        const isOwnMessage = message.userId === currentUserId;
                        return (_jsx("div", { className: `flex ${isOwnMessage ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-[85%] rounded-2xl px-3 py-2 ${isOwnMessage
                                    ? "bg-slate-950 text-white"
                                    : "bg-white text-slate-800 shadow-sm"}`, children: [_jsxs("div", { className: "mb-1 flex items-center justify-between gap-3", children: [_jsx("span", { className: `text-xs font-bold ${isOwnMessage ? "text-white/80" : "text-slate-500"}`, children: isOwnMessage ? "You" : message.username }), _jsx("span", { className: `text-[10px] ${isOwnMessage ? "text-white/50" : "text-slate-400"}`, children: new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }) })] }), _jsx("p", { className: "break-words text-sm leading-5", children: message.message })] }) }, message.id));
                    }), _jsx("div", { ref: bottomRef })] }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-4 flex gap-2", children: [_jsx("input", { value: messageInput, onChange: (event) => setMessageInput(event.target.value), placeholder: "Type a message...", maxLength: 500, className: "min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4" }), _jsx("button", { className: "inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800", title: "Send message", type: "submit", children: _jsx(Send, { className: "h-4 w-4" }) })] })] }));
}
