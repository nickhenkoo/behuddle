import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { roleLabel } from "@/lib/utils/roles";

interface Profile {
  id: string;
  location?: string | null;
  role?: string | null;
}

export async function NearbyPeople({
  profile,
  currentUserId,
}: {
  profile: Profile;
  currentUserId: string;
}) {
  if (!profile.location) return null;

  const supabase = await createClient();

  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name, role, bio, avatar_url, location")
    .eq("location", profile.location)
    .eq("is_open_to_match", true)
    .neq("id", currentUserId)
    .limit(3);

  if (!people?.length) return null;

  return (
    <div className="mt-8 mb-6">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sage-dark" />
          <p className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
            In {profile.location}
          </p>
        </div>
        <Link href="/dashboard/people" className="text-[12px] font-medium text-neutral-400 hover:text-[#1A1918] transition-colors">
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {people.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(26,25,24,0.03)] border border-black/[0.02] hover:shadow-[0_6px_24px_rgba(26,25,24,0.06)] hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center shrink-0 text-[13px] font-semibold text-neutral-600 overflow-hidden">
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                (p.full_name?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[14px] font-semibold text-[#1A1918]">{p.full_name ?? "Anonymous"}</p>
                <span className={`text-[10px] font-medium px-2 py-[2px] rounded-full border ${
                  p.role === "builder" ? "bg-indigo-50/50 text-indigo-600 border-indigo-100" : "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                }`}>
                  {roleLabel(p.role)}
                </span>
              </div>
              {p.bio && <p className="text-[13px] text-neutral-500 truncate">{p.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
