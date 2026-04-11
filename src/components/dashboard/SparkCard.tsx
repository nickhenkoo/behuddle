import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function SparkCard({ userId }: { userId: string }) {
  const supabase = await createClient();

  type SparkMatch = {
    id: string; spark_text: string | null; score: number | null; project_id: string | null;
    profile_a: string; profile_b: string;
    projects: { title: string } | { title: string }[] | null;
    profiles_a: { id: string; full_name: string | null; role: string | null; bio: string | null } | { id: string; full_name: string | null; role: string | null; bio: string | null }[] | null;
    profiles_b: { id: string; full_name: string | null; role: string | null; bio: string | null } | { id: string; full_name: string | null; role: string | null; bio: string | null }[] | null;
  };
  const { data: matchRaw } = await supabase
    .from("matches")
    .select(`
      id, spark_text, score, project_id,
      profile_a, profile_b,
      projects(title),
      profiles_a:profiles!matches_profile_a_fkey(id, full_name, role, bio),
      profiles_b:profiles!matches_profile_b_fkey(id, full_name, role, bio)
    `)
    .or(`profile_a.eq.${userId},profile_b.eq.${userId}`)
    .eq("status_a", "pending")
    .eq("status_b", "pending")
    .order("score", { ascending: false })
    .limit(1)
    .single();
  const match = matchRaw as unknown as SparkMatch | null;

  if (!match) {
    return (
      <div className="bg-white border border-neutral-200/80 rounded-xl px-5 py-5">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Spark of the day</p>
        <p className="text-[13.5px] text-neutral-500">
          No pending matches yet. Complete your profile and check back.
        </p>
      </div>
    );
  }

  const other = match.profile_a === userId
    ? (Array.isArray(match.profiles_b) ? match.profiles_b[0] : match.profiles_b)
    : (Array.isArray(match.profiles_a) ? match.profiles_a[0] : match.profiles_a);

  const project = Array.isArray(match.projects) ? match.projects[0] : match.projects;

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl px-5 py-5">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">Spark of the day</p>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-[13px] font-semibold text-neutral-600">
          {(other?.full_name?.[0] ?? "?").toUpperCase()}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-neutral-900">{other?.full_name ?? "Someone"}</p>
          <p className="text-[12px] text-neutral-400 capitalize">{other?.role}</p>
        </div>
        {match.score != null && (
          <span className="ml-auto text-[12px] font-medium text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-0.5">
            {Math.round(Number(match.score))}% match
          </span>
        )}
      </div>

      {match.spark_text && (
        <p className="text-[13.5px] text-neutral-700 leading-relaxed border-l-2 border-indigo-200 pl-3 mb-4">
          {match.spark_text}
        </p>
      )}

      {project?.title && (
        <p className="text-[12px] text-neutral-400 mb-4">Project: {project.title}</p>
      )}

      <div className="flex gap-2">
        <Link
          href={`/dashboard/matches`}
          className="flex-1 text-center bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Review match
        </Link>
      </div>
    </div>
  );
}
