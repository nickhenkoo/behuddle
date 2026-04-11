import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
          In {profile.location}
        </p>
        <Link href="/dashboard/people" className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors">
          See all
        </Link>
      </div>
      <div className="space-y-2">
        {people.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-white border border-neutral-200/80 rounded-xl px-4 py-3 hover:border-neutral-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-[12px] font-semibold text-neutral-600 overflow-hidden">
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (p.full_name?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-900">{p.full_name ?? "Anonymous"}</p>
              {p.bio && <p className="text-[12px] text-neutral-500 truncate">{p.bio}</p>}
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
              p.role === "builder" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              {p.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
