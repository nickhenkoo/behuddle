"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/clients";
import { Send } from "lucide-react";

export default function WeeklyAnswerFormClient({
  questionId,
  userId,
}: {
  questionId: number;
  userId: string;
}) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("weekly_question_answers")
        .upsert({ profile_id: userId, question_id: questionId, answer: answer.trim() });
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-[14px] text-sage-light font-medium bg-white/5 rounded-xl px-4 py-3 w-fit border border-white/10">
        Thanks for answering. <span className="text-white">✓</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Share your thoughts..."
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 focus:bg-white/10 focus:border-white/20 rounded-[16px] px-4 py-3.5 text-[14px] text-white placeholder-white/40 outline-none transition-all duration-200 resize-none custom-scrollbar shadow-inner"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !answer.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1A1918] hover:bg-[#f6f5f4] disabled:bg-white/20 disabled:text-white/40 rounded-full text-[13px] font-semibold transition-all duration-200 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
        >
          {isPending ? "Sending..." : "Submit answer"}
          {!isPending && <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </form>
  );
}
