"use client";

import { useState } from "react";
import { ProfileCardData, ProfileCardPopup } from "@/components/dashboard/ProfileCard";
import { motion } from "framer-motion";
import { roleLabel } from "@/lib/utils/roles";

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
    <div className="w-full">
      <div className="max-w-2xl mx-auto pt-4 pb-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#1A1918]">People</h1>
            <p className="text-[14px] text-neutral-500 mt-1 font-medium">{filtered.length} open to collaborating</p>
          </div>

          {/* Role filter - Minimal Text Links */}
          <div className="flex items-center gap-4">
            {ROLE_FILTER.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative text-[13px] font-medium pb-1 transition-colors ${
                  role === r
                    ? "text-[#1A1918]"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {r === "all" ? "All" : roleLabel(r)}
                {role === r && (
                  <motion.div
                    layoutId="people-role-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-sage-light"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {filtered.map((p) => {
            const skills = (p.profile_skills ?? [])
              .map((ps: { skills: { name: string } | null }) => ps.skills?.name)
              .filter(Boolean) as string[];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                className={`text-left flex items-start gap-4 px-4 py-4 transition-all duration-200 rounded-[20px] ${
                  selected?.id === p.id
                    ? "bg-white shadow-[0_4px_24px_rgba(26,25,24,0.06)] scale-[1.01] z-10 relative"
                    : "hover:bg-black/[0.03]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-12 h-12 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center text-[14px] font-semibold text-neutral-600 overflow-hidden shadow-sm">
                    {p.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (p.full_name?.[0] ?? "?").toUpperCase()
                    }
                  </div>
                  {p.status && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#f6f5f4] ${STATUS_DOT[p.status] ?? "bg-neutral-400"}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-[#1A1918]">{p.full_name ?? "Anonymous"}</span>
                    {p.is_verified && (
                      <img src="/icons/iconsax-star-3-acb2d2d1d45f-.svg" alt="Verified" className="w-3.5 h-3.5 shrink-0" style={{ filter: "invert(75%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(1.1)" }} />
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-3 py-1 rounded-full tracking-wide ${
                      p.role === "builder"
                        ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)]"
                        : "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                      {roleLabel(p.role)}
                    </span>
                  </div>
                  
                  {p.bio && <p className="text-[13px] text-neutral-500 mt-1 line-clamp-1 leading-relaxed">{p.bio}</p>}
                  
                  {/* Skills & Location Row */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {p.location && <span className="text-[12px] text-neutral-400 font-medium">{p.location}</span>}
                    {p.location && skills.length > 0 && <span className="w-1 h-1 rounded-full bg-neutral-300" />}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((s) => (
                          <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-white text-neutral-600 border border-black/[0.06] shadow-[0_2px_4px_rgba(0,0,0,0.01)]">{s}</span>
                        ))}
                        {skills.length > 4 && <span className="text-[11px] font-medium text-neutral-400 px-1">+{skills.length - 4}</span>}
                      </div>
                    )}
                  </div>
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

      {/* Profile card popup */}
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
