import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ChatMessage } from "../types";

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

export function ChatBox({
  messages,
  currentUserId,
  onSendMessage,
}: ChatBoxProps) {
  const [messageInput, setMessageInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = messageInput.trim();

    if (!cleanMessage) {
      return;
    }

    onSendMessage(cleanMessage);
    setMessageInput("");
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <MessageCircle className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-950">Room Chat</h2>
          <p className="text-sm text-slate-500">
            Messages are synced live and saved in cloud database.
          </p>
        </div>
      </div>

      <div className="h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.userId === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  isOwnMessage
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span
                    className={`text-xs font-bold ${
                      isOwnMessage ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {isOwnMessage ? "You" : message.username}
                  </span>

                  <span
                    className={`text-[10px] ${
                      isOwnMessage ? "text-white/50" : "text-slate-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="break-words text-sm leading-5">
                  {message.message}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-purple-200 focus:ring-4"
        />

        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          title="Send message"
          type="submit"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}