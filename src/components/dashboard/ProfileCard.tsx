"use client";

import { useState, useRef } from "react";
import { MapPin, Clock, Zap } from "lucide-react";

export interface ProfileCardData {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  bio?: string | null;
  motivation?: string | null;
  location?: string | null;
  status?: string | null;
  availability_hours?: number | null;
  is_verified?: boolean | null;
  profile_skills?: { skills: { name: string } | null }[] | null;
}

const STATUS_DOT: Record<string, string> = {
  open: "bg-emerald-500",
  looking_for_designer: "bg-indigo-500",
  busy: "bg-amber-500",
  away: "bg-neutral-400",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open to match",
  looking_for_designer: "Need designer",
  busy: "Busy",
  away: "Away",
};

// ── Card itself ───────────────────────────────────────────────────────────────

export function ProfileCardPopup({ profile }: { profile: ProfileCardData }) {
  const skills = (profile.profile_skills ?? [])
    .map((ps) => ps.skills?.name)
    .filter(Boolean) as string[];

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="w-64 bg-white rounded-2xl border border-neutral-200 shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-4 pointer-events-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[13px] font-semibold overflow-hidden shrink-0">
          {profile.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13.5px] font-semibold text-neutral-900 truncate">
              {profile.full_name ?? "Anonymous"}
            </p>
            {profile.is_verified && (
              <Zap className="w-3 h-3 text-indigo-500 shrink-0" aria-label="Verified" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-medium capitalize px-1.5 py-0.5 rounded-full ${
              profile.role === "builder"
                ? "bg-indigo-50 text-indigo-600"
                : "bg-emerald-50 text-emerald-600"
            }`}>
              {profile.role ?? "member"}
            </span>
            {profile.status && (
              <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[profile.status] ?? "bg-neutral-400"}`} />
                {STATUS_LABEL[profile.status] ?? profile.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-[12.5px] text-neutral-600 leading-relaxed line-clamp-3 mb-3">
          {profile.bio}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        {profile.location && (
          <span className="flex items-center gap-1 text-[11.5px] text-neutral-400">
            <MapPin className="w-3 h-3" />{profile.location}
          </span>
        )}
        {profile.availability_hours && (
          <span className="flex items-center gap-1 text-[11.5px] text-neutral-400">
            <Clock className="w-3 h-3" />{profile.availability_hours}h/wk
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 5).map((s) => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
              {s}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="text-[11px] text-neutral-400 px-1">+{skills.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hover wrapper ─────────────────────────────────────────────────────────────

export function ProfileHover({
  profile,
  children,
  side = "right",
}: {
  profile: ProfileCardData;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
}) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), 300);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 150);
  };

  const posClass = {
    right:  "left-full top-0 ml-2",
    left:   "right-full top-0 mr-2",
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  }[side];

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute z-50 ${posClass}`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <ProfileCardPopup profile={profile} />
        </div>
      )}
    </div>
  );
}
