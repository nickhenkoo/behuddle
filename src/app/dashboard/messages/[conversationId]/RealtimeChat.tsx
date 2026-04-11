"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createClient } from "@/lib/supabase/clients";
import { markMessagesAsRead } from "@/lib/supabase/actions";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function RealtimeChat({
  conversationId,
  userId,
  initialMessages,
}: {
  conversationId: string;
  userId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when entering conversation
  useEffect(() => {
    markMessagesAsRead(conversationId);
  }, [conversationId]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Avoid duplicate if we added it optimistically
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const send = () => {
    const content = text.trim();
    if (!content || isPending) return;
    setText("");

    // Optimistic message (temp id)
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      sender_id: userId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: userId, content })
        .select("id, content, sender_id, created_at")
        .single();

      if (data) {
        // Replace optimistic with real
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
      }
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Group consecutive messages by sender
  const grouped = messages.reduce<{ sender: string; msgs: Message[] }[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.sender === msg.sender_id) {
      last.msgs.push(msg);
    } else {
      acc.push({ sender: msg.sender_id, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F8F9FA] space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-neutral-400 py-10">
            Say hello. This is the start of something.
          </p>
        )}

        {grouped.map((group, gi) => {
          const isMe = group.sender === userId;
          return (
            <div key={gi} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
              {group.msgs.map((msg, mi) => (
                <div
                  key={msg.id}
                  className={`max-w-[75%] px-3.5 py-2 text-[13.5px] leading-relaxed ${
                    isMe
                      ? "bg-neutral-900 text-white"
                      : "bg-white border border-neutral-200 text-neutral-900"
                  } ${
                    group.msgs.length === 1
                      ? isMe ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
                      : mi === 0
                      ? isMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                      : mi === group.msgs.length - 1
                      ? isMe ? "rounded-2xl rounded-tr-sm rounded-br-md" : "rounded-2xl rounded-tl-sm rounded-bl-md"
                      : isMe ? "rounded-2xl rounded-r-sm" : "rounded-2xl rounded-l-sm"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <span className="text-[10.5px] text-neutral-400 px-1">
                {formatTime(group.msgs[group.msgs.length - 1].created_at)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-neutral-200/80 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Type a message…"
            className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-neutral-300 focus:ring-3 focus:ring-neutral-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150 resize-none max-h-32 overflow-y-auto"
            style={{ height: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || isPending}
            className="w-9 h-9 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
