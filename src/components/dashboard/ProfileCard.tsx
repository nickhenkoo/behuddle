"use client";

import { ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";
import { roleLabel } from "@/lib/utils/roles";

export interface ProfileCardData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  location: string | null;
  status: string | null;
  availability_hours: number | null;
  portfolio_url: string | null;
  github_url: string | null;
  is_verified: boolean | null;
  profile_skills?: { skills: { id: number; name: string } | null }[] | null;
}

export function ProfileCardPopup({ profile }: { profile: ProfileCardData }) {
  const skills = (profile.profile_skills ?? [])
    .map((ps) => ps.skills?.name)
    .filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="w-full max-w-[400px] bg-white rounded-[28px] overflow-hidden shadow-[0_16px_64px_rgba(26,25,24,0.1)] border border-black/[0.04]"
    >
      {/* Header pattern */}
      <div className="h-24 bg-gradient-to-br from-sage-light/20 to-transparent" />
      
      <div className="px-6 pb-6 -mt-12 relative">
        <div className="flex justify-between items-start mb-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-[24px] font-semibold text-neutral-600 overflow-hidden border border-black/[0.04]">
              {profile.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : (profile.full_name?.[0] ?? "?").toUpperCase()
              }
            </div>
          </div>
          <div className="pt-14 flex gap-2">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 hover:text-[#1A1918] transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 hover:text-[#1A1918] transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[20px] font-display font-bold text-[#1A1918] leading-tight">
              {profile.full_name ?? "Anonymous"}
            </h2>
            {profile.is_verified && (
              <img
                src="/icons/iconsax-star-3-acb2d2d1d45f-.svg"
                alt="Verified"
                className="w-4 h-4"
                style={{ filter: "invert(75%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(1.1)" }}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full border ${
              profile.role === "builder" ? "bg-indigo-50/50 text-indigo-600 border-indigo-100" : "bg-emerald-50/50 text-emerald-600 border-emerald-100"
            }`}>
              {roleLabel(profile.role)}
            </span>
            {profile.location && (
              <span className="text-[13px] text-neutral-500 font-medium">
                {profile.location}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <p className="text-[14px] text-neutral-600 leading-relaxed bg-[#f6f5f4] p-4 rounded-2xl">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {profile.status && (
            <div className="bg-white border border-black/[0.04] rounded-xl p-3">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-1">Status</p>
              <p className="text-[13px] font-medium text-[#1A1918] capitalize flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  profile.status === 'open' ? 'bg-emerald-500' :
                  profile.status === 'looking_for_designer' ? 'bg-indigo-500' :
                  profile.status === 'busy' ? 'bg-amber-500' : 'bg-neutral-400'
                }`} />
                {profile.status.replace(/_/g, " ")}
              </p>
            </div>
          )}
          {profile.availability_hours !== null && (
            <div className="bg-white border border-black/[0.04] rounded-xl p-3">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-1">Availability</p>
              <p className="text-[13px] font-medium text-[#1A1918]">
                {profile.availability_hours} hours / week
              </p>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-white text-neutral-600 border border-black/[0.06] shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
