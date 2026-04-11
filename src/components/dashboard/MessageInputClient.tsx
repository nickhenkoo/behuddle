"use client";

import { useState, useTransition, useRef } from "react";
import { createClient } from "@/lib/supabase/clients";
import { Send } from "lucide-react";

export default function MessageInputClient({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    if (!text.trim() || isPending) return;
    const content = text.trim();
    setText("");
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
      });
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
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
  );
}
