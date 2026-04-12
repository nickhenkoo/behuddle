import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export async function SpotlightProject() {
  const supabase = await createClient();
  const week = getISOWeek(new Date());

  type SpotlightRow = { id: string; title: string; description: string | null; stage: string | null; what_needed: string | null; profiles: { full_name: string | null } | { full_name: string | null }[] | null };
  const { data: projectRaw } = await supabase
    .from("projects")
    .select("id, title, description, stage, what_needed, profiles(full_name)")
    .eq("is_spotlight", true)
    .eq("spotlight_week", week)
    .single();
  const project = projectRaw as unknown as SpotlightRow | null;

  if (!project) return null;

  const owner = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;

  return (
    <div className="bg-white rounded-[24px] px-6 py-6 shadow-[0_4px_24px_rgba(26,25,24,0.04)] border border-black/[0.03] transition-all hover:shadow-[0_8px_32px_rgba(26,25,24,0.06)] group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <p className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
            Spotlight this week
          </p>
        </div>
      </div>
      
      <h3 className="text-[20px] font-display font-bold text-[#1A1918] mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{project.title}</h3>
      
      {owner?.full_name && (
        <p className="text-[13px] font-medium text-neutral-400 mb-4 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-black/[0.04] inline-flex items-center justify-center text-[8px] text-[#1A1918]">{(owner.full_name[0] ?? "?").toUpperCase()}</span>
          {owner.full_name}
        </p>
      )}

      {project.description && (
        <p className="text-[14px] text-neutral-600 line-clamp-3 mb-5 leading-relaxed">{project.description}</p>
      )}
      
      {project.what_needed && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-[12px] px-3 py-2.5 mb-5 flex items-start gap-2">
          <span className="text-[12px] font-semibold text-indigo-600 uppercase tracking-wide mt-0.5">Need</span>
          <p className="text-[13px] font-medium text-indigo-800 leading-snug">{project.what_needed}</p>
        </div>
      )}
      
      <Link
        href="/dashboard/ideas"
        className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full bg-[#f6f5f4] text-[#1A1918] text-[13px] font-semibold hover:bg-black/[0.04] transition-colors shadow-sm border border-black/[0.02]"
      >
        See all ideas
        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
      </Link>
    </div>
  );
}
