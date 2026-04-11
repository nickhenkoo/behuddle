"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/clients";

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
      <p className="text-[13px] text-neutral-500">
        Thanks for answering. ✓
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        maxLength={300}
        placeholder="Your answer…"
        className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150 resize-none"
      />
      <button
        type="submit"
        disabled={isPending || !answer.trim()}
        className="text-[13px] font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending…" : "Send answer"}
      </button>
    </form>
  );
}
