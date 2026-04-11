import { createClient } from "@/lib/supabase/server";
import WeeklyAnswerFormClient from "./WeeklyAnswerFormClient";

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
    <div className="bg-white border border-neutral-200/80 rounded-xl px-5 py-5">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">
        This week&apos;s question
      </p>
      <p className="text-[14px] font-medium text-neutral-900 mb-4">{question.question}</p>
      <WeeklyAnswerFormClient questionId={question.id} userId={userId} />
    </div>
  );
}
