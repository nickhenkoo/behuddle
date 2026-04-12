import { createClient } from "@/lib/supabase/server";
import WeeklyAnswerFormClient from "./WeeklyAnswerFormClient";
import { MessageCircleQuestion } from "lucide-react";

function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export async function WeeklyQuestion({ userId }: { userId: string }) {
  const supabase = await createClient();

  const now = new Date();
  const week = getISOWeek(now);
  const year = now.getFullYear();

  const { data: question } = await supabase
    .from("weekly_questions")
    .select("id, question")
    .eq("week_number", week)
    .eq("year", year)
    .single();

  if (!question) return null;

  const { data: answer } = await supabase
    .from("weekly_question_answers")
    .select("answer")
    .eq("profile_id", userId)
    .eq("question_id", question.id)
    .single();

  if (answer) return null;

  return (
    <div className="bg-[#1A1918] text-white rounded-[24px] px-6 py-6 shadow-[0_12px_40px_rgba(26,25,24,0.1)] relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sage-light/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircleQuestion className="w-4 h-4 text-sage-light" />
          <p className="text-[12px] font-semibold text-sage-light uppercase tracking-wide">
            This week's question
          </p>
        </div>
        <p className="text-[18px] font-medium text-white mb-6 leading-snug max-w-[90%] font-display">
          {question.question}
        </p>
        <WeeklyAnswerFormClient questionId={question.id} userId={userId} />
      </div>
    </div>
  );
}
