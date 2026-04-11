"use client";

import { useState } from "react";
import { ProfileCardData, ProfileCardPopup } from "@/components/dashboard/ProfileCard";
import { Zap } from "lucide-react";

const ROLE_FILTER = ["all", "builder", "contributor"] as const;
type RoleFilter = typeof ROLE_FILTER[number];

const STATUS_DOT: Record<string, string> = {
  open: "bg-emerald-500",
  looking_for_designer: "bg-indigo-500",
  busy: "bg-amber-500",
  away: "bg-neutral-400",
};

export default function PeopleClient({ people }: { people: ProfileCardData[] }) {
  const [role, setRole] = useState<RoleFilter>("all");
  const [selected, setSelected] = useState<ProfileCardData | null>(null);

  const filtered = role === "all" ? people : people.filter((p) => p.role === role);

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">People</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">{filtered.length} open to collaborating</p>
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-1">
            {ROLE_FILTER.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg capitalize transition-all duration-150 ${
                  role === r
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-2">
          {filtered.map((p) => {
            const skills = (p.profile_skills ?? [])
              .map((ps: { skills: { name: string } | null }) => ps.skills?.name)
              .filter(Boolean) as string[];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className={`text-left flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 transition-all duration-100 ${
                  selected?.id === p.id
                    ? "border-neutral-400 shadow-sm"
                    : "border-neutral-200/80 hover:border-neutral-300"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-[12px] font-semibold text-neutral-700 overflow-hidden">
                    {p.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (p.full_name?.[0] ?? "?").toUpperCase()
                    }
                  </div>
                  {p.status && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_DOT[p.status] ?? "bg-neutral-400"}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-medium text-neutral-900">{p.full_name ?? "Anonymous"}</span>
                    {p.is_verified && <Zap className="w-3 h-3 text-indigo-500 shrink-0" />}
                    <span className={`text-[11px] font-medium capitalize px-1.5 py-0.5 rounded-full ${
                      p.role === "builder" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {p.role}
                    </span>
                    {p.location && <span className="text-[12px] text-neutral-400">{p.location}</span>}
                  </div>
                  {p.bio && <p className="text-[12.5px] text-neutral-500 mt-0.5 line-clamp-1">{p.bio}</p>}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">{s}</span>
                      ))}
                      {skills.length > 4 && <span className="text-[11px] text-neutral-400 px-1">+{skills.length - 4}</span>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[13.5px] text-neutral-500">No {role === "all" ? "people" : role + "s"} found.</p>
          </div>
        )}
      </div>

      {/* Profile card popup (click to open) */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-0" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
            <ProfileCardPopup profile={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
