import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
    <div className="bg-white border border-neutral-200/80 rounded-xl px-5 py-5">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">
        Spotlight this week
      </p>
      <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">{project.title}</h3>
      {project.description && (
        <p className="text-[13px] text-neutral-500 line-clamp-3 mb-3">{project.description}</p>
      )}
      {project.what_needed && (
        <p className="text-[12.5px] text-indigo-600 mb-3">Looking for: {project.what_needed}</p>
      )}
      {owner?.full_name && (
        <p className="text-[12px] text-neutral-400 mb-4">by {owner.full_name}</p>
      )}
      <Link
        href="/dashboard/ideas"
        className="text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        See all ideas →
      </Link>
    </div>
  );
}
