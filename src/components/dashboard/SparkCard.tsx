import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { roleLabel } from "@/lib/utils/roles";

export async function SparkCard({ userId }: { userId: string }) {
  const supabase = await createClient();

  type SparkMatch = {
    id: string; spark_text: string | null; score: number | null; project_id: string | null;
    profile_a: string; profile_b: string;
    projects: { title: string } | { title: string }[] | null;
    profiles_a: { id: string; full_name: string | null; role: string | null; bio: string | null; avatar_url: string | null } | { id: string; full_name: string | null; role: string | null; bio: string | null; avatar_url: string | null }[] | null;
    profiles_b: { id: string; full_name: string | null; role: string | null; bio: string | null; avatar_url: string | null } | { id: string; full_name: string | null; role: string | null; bio: string | null; avatar_url: string | null }[] | null;
  };
  const { data: matchRaw } = await supabase
    .from("matches")
    .select(`
      id, spark_text, score, project_id,
      profile_a, profile_b,
      projects(title),
      profiles_a:profiles!matches_profile_a_fkey(id, full_name, role, bio, avatar_url),
      profiles_b:profiles!matches_profile_b_fkey(id, full_name, role, bio, avatar_url)
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
      <div className="bg-white rounded-[24px] px-6 py-6 shadow-[0_8px_32px_rgba(26,25,24,0.04)] border border-black/[0.03]">
        <div className="flex items-center gap-2 mb-4">
          <img src="/icons/magic-star.svg" alt="" className="w-4 h-4" style={{ filter: "invert(72%) sepia(60%) saturate(600%) hue-rotate(5deg) brightness(1.05)" }} />
          <p className="text-[12px] font-semibold text-neutral-500 tracking-wide uppercase">Spark of the day</p>
        </div>
        <p className="text-[14px] text-neutral-500 leading-relaxed">
          No pending matches yet. Complete your profile and check back soon.
        </p>
      </div>
    );
  }

  const other = match.profile_a === userId
    ? (Array.isArray(match.profiles_b) ? match.profiles_b[0] : match.profiles_b)
    : (Array.isArray(match.profiles_a) ? match.profiles_a[0] : match.profiles_a);

  const project = Array.isArray(match.projects) ? match.projects[0] : match.projects;

  return (
    <div className="bg-white rounded-[24px] px-6 py-6 shadow-[0_8px_32px_rgba(26,25,24,0.04)] border border-black/[0.03] transition-all hover:shadow-[0_12px_40px_rgba(26,25,24,0.08)]">
      <div className="flex items-center gap-2 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/magic-star.svg" alt="" className="w-4 h-4" style={{ filter: "invert(72%) sepia(60%) saturate(600%) hue-rotate(5deg) brightness(1.05)" }} />
        <p className="text-[12px] font-semibold text-neutral-500 tracking-wide uppercase">Spark of the day</p>
      </div>

      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center shrink-0 text-[14px] font-semibold text-neutral-600 border border-black/[0.04] overflow-hidden">
          {other?.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
            : (other?.full_name?.[0] ?? "?").toUpperCase()
          }
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[16px] font-semibold text-[#1A1918]">{other?.full_name ?? "Someone"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${
              other?.role === "builder" ? "bg-indigo-50/50 text-indigo-600 border-indigo-100" : "bg-emerald-50/50 text-emerald-600 border-emerald-100"
            }`}>
              {roleLabel(other?.role)}
            </span>
          </div>
        </div>
        {match.score != null && (
          <div className="shrink-0 text-right pt-0.5">
            <p className="text-[20px] font-display font-bold text-[#1A1918] leading-none">{Math.round(Number(match.score))}</p>
            <p className="text-[11px] font-medium text-neutral-400 mt-1">score</p>
          </div>
        )}
      </div>

      {match.spark_text && (
        <div className="mb-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-indigo-200" />
          <p className="text-[14px] text-neutral-700 leading-relaxed italic pl-4">
            "{match.spark_text}"
          </p>
        </div>
      )}

      {project?.title && (
        <div className="bg-[#f6f5f4] rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">For project</span>
          <span className="text-[13px] font-semibold text-[#1A1918] truncate max-w-[200px]">{project.title}</span>
        </div>
      )}

      <div className="flex">
        <Link
          href={`/dashboard/matches`}
          className="btn-pill-dark w-full py-3"
        >
          Review match
        </Link>
      </div>
    </div>
  );
}
