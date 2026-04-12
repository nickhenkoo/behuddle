"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Zap, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";
import { respondToMatch, runMatchmaking } from "@/lib/supabase/actions";
import { ProfileCardData } from "@/components/dashboard/ProfileCard";
import { roleLabel } from "@/lib/utils/roles";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  score?: number | null;
  spark_text?: string | null;
  project_id?: string | null;
  status_a: string;
  status_b: string;
  profile_a: string;
  profile_b: string;
  profiles_a: ProfileCardData | ProfileCardData[] | null;
  profiles_b: ProfileCardData | ProfileCardData[] | null;
  projects?: { id: string; title: string; what_needed?: string | null; description?: string | null } | null;
  conversations?: { id: string }[] | null;
}

interface Props {
  matches: Match[];
  userId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOther(match: Match, userId: string): ProfileCardData | null {
  if (match.profile_a === userId) {
    return Array.isArray(match.profiles_b) ? match.profiles_b[0] : match.profiles_b;
  }
  return Array.isArray(match.profiles_a) ? match.profiles_a[0] : match.profiles_a;
}

function getMyStatus(match: Match, userId: string) {
  return match.profile_a === userId ? match.status_a : match.status_b;
}

function getTheirStatus(match: Match, userId: string) {
  return match.profile_a === userId ? match.status_b : match.status_a;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500",
  looking_for_designer: "bg-indigo-500",
  busy: "bg-amber-500",
  away: "bg-neutral-400",
};

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({
  match,
  userId,
  onRespond,
}: {
  match: Match;
  userId: string;
  onRespond: (id: string, r: "yes" | "no" | "deferred") => void;
}) {
  const other = getOther(match, userId);
  const myStatus = getMyStatus(match, userId);
  const theirStatus = getTheirStatus(match, userId);
  const project = match.projects && !Array.isArray(match.projects) ? match.projects : null;

  if (!other) return null;

  const skills = (other.profile_skills ?? [])
    .map((ps: { skills: { name: string } | null }) => ps.skills?.name)
    .filter(Boolean) as string[];

  const isMutual = myStatus === "yes" && theirStatus === "yes";
  const isPending = myStatus === "pending";
  const isDeferred = myStatus === "deferred";
  const conversationId = match.conversations?.[0]?.id;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      isMutual ? "shadow-[0_4px_24px_rgba(16,185,129,0.12)] border-emerald-100" : "border border-black/[0.03] shadow-[0_4px_24px_rgba(26,25,24,0.04)]"
    }`}>
      {/* Mutual badge */}
      {isMutual && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[12.5px] font-medium text-emerald-700">Mutual match</span>
          </div>
          {conversationId ? (
            <Link
              href={`/dashboard/messages/${conversationId}`}
              className="flex items-center gap-1 text-[12.5px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open chat
            </Link>
          ) : (
            <span className="text-[12px] text-emerald-600/60">Chat opening…</span>
          )}
        </div>
      )}

      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[14px] font-semibold overflow-hidden">
              {other.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                : (other.full_name?.[0] ?? "?").toUpperCase()
              }
            </div>
            {other.status && (
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_COLORS[other.status] ?? "bg-neutral-400"}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-[#1A1918]">{other.full_name ?? "Anonymous"}</p>
              {other.is_verified && (
                <img src="/icons/iconsax-star-3-acb2d2d1d45f-.svg" alt="Verified" className="w-3.5 h-3.5 shrink-0" style={{ filter: "invert(75%) sepia(60%) saturate(500%) hue-rotate(10deg) brightness(1.1)" }} />
              )}
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ml-auto ${
                other.role === "builder" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {roleLabel(other.role)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-neutral-400 mt-0.5">
              {other.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{other.location}</span>}
              {other.availability_hours && <span>{other.availability_hours}h/wk</span>}
            </div>
          </div>

          {/* Score */}
          {match.score != null && (
            <div className="shrink-0 text-right">
              <p className="text-[18px] font-display font-bold text-[#1A1918]">{Math.round(match.score)}</p>
              <p className="text-[10px] text-neutral-400 -mt-0.5">score</p>
            </div>
          )}
        </div>

        {/* Spark text */}
        {match.spark_text && (
          <div className="flex gap-2.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[13px] text-neutral-700 leading-relaxed italic">
              {match.spark_text}
            </p>
          </div>
        )}

        {/* Bio preview */}
        {!match.spark_text && other.bio && (
          <p className="text-[13px] text-neutral-500 line-clamp-2 mb-3">{other.bio}</p>
        )}

        {/* Project */}
        {project && (
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2 mb-3">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-0.5">For project</p>
            <p className="text-[13px] font-medium text-neutral-800">{project.title}</p>
            {project.what_needed && (
              <p className="text-[12px] text-indigo-600 mt-0.5">{project.what_needed}</p>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 5).map((s) => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                {s}
              </span>
            ))}
            {skills.length > 5 && <span className="text-[11px] text-neutral-400 px-1">+{skills.length - 5}</span>}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRespond(match.id, "no")}
              className="flex-1 flex items-center justify-center gap-1.5 btn-pill-outline hover:bg-red-50/50 hover:border-red-200 hover:text-red-600 w-full"
            >
              <X className="w-4 h-4" />
              Pass
            </button>
            <button
              type="button"
              onClick={() => onRespond(match.id, "deferred")}
              className="flex items-center justify-center gap-1.5 btn-pill-outline hover:bg-sage-light/10 hover:text-sage-dark hover:border-sage-light/30 px-4"
              title="Later"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRespond(match.id, "yes")}
              className="flex-1 flex items-center justify-center gap-1.5 btn-pill-dark w-full"
            >
              <Check className="w-4 h-4" />
              Connect
            </button>
          </div>
        )}

        {isDeferred && (
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-neutral-400">Deferred — revisit later</span>
            <button
              type="button"
              onClick={() => onRespond(match.id, "yes")}
              className="text-[12.5px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Connect now →
            </button>
          </div>
        )}

        {myStatus === "yes" && theirStatus === "pending" && (
          <p className="text-[12.5px] text-neutral-400">Waiting for their response…</p>
        )}

        {myStatus === "no" && (
          <p className="text-[12.5px] text-neutral-400">You passed on this one.</p>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MatchesClient({ matches, userId }: Props) {
  const [list, setList] = useState(matches);
  const [isRunning, startRunning] = useTransition();

  const handleRunMatchmaking = () => {
    startRunning(async () => {
      await runMatchmaking();
    });
  };

  const handleRespond = (matchId: string, response: "yes" | "no" | "deferred") => {
    setList((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const isA = m.profile_a === userId;
        return {
          ...m,
          status_a: isA ? response : m.status_a,
          status_b: isA ? m.status_b : response,
        };
      })
    );
    respondToMatch(matchId, response);
  };

  const pending  = list.filter((m) => getMyStatus(m, userId) === "pending");
  const mutual   = list.filter((m) => getMyStatus(m, userId) === "yes" && getTheirStatus(m, userId) === "yes");
  const waiting  = list.filter((m) => getMyStatus(m, userId) === "yes" && getTheirStatus(m, userId) === "pending");
  const deferred = list.filter((m) => getMyStatus(m, userId) === "deferred");

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto pt-4 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#1A1918]">Matches</h1>
            <p className="text-[13.5px] text-neutral-500 mt-0.5">
              {pending.length > 0 ? `${pending.length} waiting for your response` : "You're all caught up"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunMatchmaking}
            disabled={isRunning}
            className="flex items-center gap-2 btn-pill-dark disabled:opacity-50"
          >
            <img src="/icons/iconsax-repeat-arrow-609f448bc58a-.svg" alt="" className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Finding…" : "Find matches"}
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <img src="/icons/iconsax-repeat-arrow-609f448bc58a-.svg" alt="" className="w-6 h-6 brightness-0 opacity-30" />
            </div>
            <h3 className="font-display text-[17px] font-semibold text-[#1A1918] mb-2">No matches yet</h3>
            <p className="text-[13.5px] text-neutral-500 max-w-xs mb-5">
              Complete your profile with skills and bio, then hit "Find matches".
            </p>
            <button
              type="button"
              onClick={handleRunMatchmaking}
              disabled={isRunning}
              className="flex items-center gap-2 btn-pill-dark disabled:opacity-50"
            >
              <img src="/icons/iconsax-repeat-arrow-609f448bc58a-.svg" alt="" className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Finding matches…" : "Find my first matches"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mutual */}
            {mutual.length > 0 && (
              <Section label="Connected">
                {mutual.map((m) => (
                  <MatchCard key={m.id} match={m} userId={userId} onRespond={handleRespond} />
                ))}
              </Section>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <Section label="New">
                <AnimatePresence>
                  {pending.map((m) => (
                    <motion.div key={m.id} layout exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.2 }}>
                      <MatchCard match={m} userId={userId} onRespond={handleRespond} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Section>
            )}

            {/* Waiting */}
            {waiting.length > 0 && (
              <Section label="Waiting for response">
                {waiting.map((m) => (
                  <MatchCard key={m.id} match={m} userId={userId} onRespond={handleRespond} />
                ))}
              </Section>
            )}

            {/* Deferred */}
            {deferred.length > 0 && (
              <Section label="Deferred">
                {deferred.map((m) => (
                  <MatchCard key={m.id} match={m} userId={userId} onRespond={handleRespond} />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-3">{label}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
