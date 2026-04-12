"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { updateProfile, logout } from "@/lib/supabase/actions";
import { Check, Sparkles } from "lucide-react";
import { ProfileCardPopup } from "@/components/dashboard/ProfileCard";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
import { roleLabel } from "@/lib/utils/roles";

// ── Types ────────────────────────────────────────────────────────────────────

interface Skill { id: number; name: string; category: string | null; }

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  motivation?: string | null;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  role?: string | null;
  status?: string | null;
  availability_hours?: number | null;
  is_open_to_match?: boolean | null;
  email_digest_opt_in?: boolean | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  profile_skills?: { skill_id: number; level: string; skills: Skill | null }[] | null;
}

interface Props {
  profile: Profile | null;
  email: string;
  allSkills: Skill[];
}

// ── Primitives ────────────────────────────────────────────────────────────────

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-[17px] font-semibold tracking-tight text-neutral-900">{label}</h2>
      {sub && <p className="text-[13px] text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-medium text-neutral-600">
        {label}
        {hint && <span className="text-neutral-400 font-normal ml-1.5">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white border border-neutral-300 hover:border-neutral-400 focus:bg-white focus:border-[#1A1918] focus:ring-3 focus:ring-black/5 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150";

// ── Profile section ───────────────────────────────────────────────────────────

const CATEGORIES = ["engineering", "design", "business", "marketing", "other"];

function ProfileSection({ profile, allSkills }: { profile: Profile | null; allSkills: Skill[] }) {
  const currentSkillIds = profile?.profile_skills?.map((ps) => ps.skill_id) ?? [];

  const [name, setName]       = useState(profile?.full_name ?? "");
  const [role, setRole]       = useState<"builder" | "contributor">(
    (profile?.role as "builder" | "contributor") ?? "builder"
  );
  const [bio, setBio]         = useState(profile?.bio ?? "");
  const [motivation, setMot]  = useState(profile?.motivation ?? "");
  const [locValue, setLocValue] = useState<LocationValue>({
    location: profile?.location ?? "",
    lat: profile?.lat ?? null,
    lng: profile?.lng ?? null,
  });
  const [avatar, setAvatar]   = useState(profile?.avatar_url ?? "");
  const [skillIds, setSkillIds] = useState<number[]>(currentSkillIds);
  const [saved, setSaved]     = useState(false);
  const [isPending, start]    = useTransition();

  const toggle = (id: number) =>
    setSkillIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = () => {
    setSaved(false);
    start(async () => {
      await updateProfile({
        role,
        bio:        bio || undefined,
        motivation: motivation || undefined,
        location:   locValue.location || undefined,
        lat:        locValue.lat ?? null,
        lng:        locValue.lng ?? null,
        skill_ids:  skillIds,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader label="Profile" sub="How you appear to other people on behuddle." />

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[18px] font-semibold overflow-hidden shrink-0">
          {avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatar} alt="" className="w-full h-full object-cover" />
            : (name?.[0] ?? "?").toUpperCase()
          }
        </div>
        <div className="flex-1">
          <Field label="Avatar URL" hint="optional">
            <input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <p className="text-[12.5px] font-medium text-neutral-600">Role</p>
        <div className="grid grid-cols-2 gap-2">
          {(["builder", "contributor"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-3 px-4 text-left rounded-2xl border transition-all duration-150 ${
                role === r
                  ? "bg-[#1A1918] border-[#1A1918] text-white shadow-sm"
                  : "bg-white border-neutral-200 hover:border-neutral-400 text-neutral-600"
              }`}
            >
              <p className="text-[13px] font-medium">{roleLabel(r)}</p>
              <p className={`text-[11.5px] mt-0.5 ${role === r ? "text-neutral-400" : "text-neutral-400"}`}>
                {r === "builder" ? "I have an idea" : "I want to build"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Field label="Display name">
        <input
          type="text"
          value={name}
          readOnly
          className={`${inputCls} opacity-60 cursor-not-allowed`}
          title="Name is set during registration"
        />
        <p className="text-[11.5px] text-neutral-400 mt-1">Set during registration — contact support to change.</p>
      </Field>

      <Field label="Bio" hint="optional">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={280}
          placeholder="Who you are, what you've built…"
          className={`${inputCls} resize-none`}
        />
        <p className="text-[11.5px] text-neutral-400 text-right">{bio.length}/280</p>
      </Field>

      <Field label="Why are you here?" hint="optional">
        <textarea value={motivation} onChange={(e) => setMot(e.target.value)} rows={2} maxLength={200}
          placeholder="What are you looking to build or find?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field label="City" hint="optional — used to show you on the Globe">
        <LocationPicker
          value={locValue}
          onChange={setLocValue}
          placeholder="e.g. Berlin, Tokyo, New York…"
          inputClassName={inputCls}
        />
      </Field>

      {/* Skills */}
      <div>
        <p className="text-[12.5px] font-medium text-neutral-600 mb-3">Skills</p>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const catSkills = allSkills.filter((s) => s.category === cat);
            if (!catSkills.length) return null;
            return (
              <div key={cat}>
                <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {catSkills.map((skill) => {
                    const active = skillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggle(skill.id)}
                        className={`text-[12px] px-3 py-1 rounded-full border transition-all duration-150 ${
                          active
                            ? "border-[#1A1918] bg-[#1A1918] text-white shadow-sm"
                            : "border-neutral-200 bg-white hover:border-neutral-400 text-neutral-600"
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 btn-pill-dark disabled:opacity-50 w-full justify-center"
      >
        {saved
          ? <><Check className="w-4 h-4" /> Saved</>
          : isPending ? "Saving…" : "Save changes"
        }
      </button>
    </div>
  );
}

// ── Subscription section ──────────────────────────────────────────────────────

const PLAN_FEATURES = {
  free: [
    "Up to 5 active matches",
    "Basic profile visibility",
    "Community read access",
    "Weekly Spark (AI match insight)",
  ],
  pro: [
    "Unlimited matches",
    "Priority in people search",
    "Post in Community",
    "Spark for every match",
    "Featured profile badge",
    "Early access to new features",
  ],
};

function SubscriptionSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader label="Plan" sub="Manage your behuddle subscription." />

      {/* Current plan */}
      <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5">
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
          <img src="/icons/iconsax-star-3-acb2d2d1d45f-.svg" alt="" className="w-4 h-4 brightness-0 opacity-40" />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-neutral-900">Free</p>
          <p className="text-[12px] text-neutral-500">Current plan</p>
        </div>
      </div>

      {/* Plans comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Free */}
        <div className="border border-neutral-200 rounded-2xl p-4">
          <p className="text-[13px] font-semibold text-neutral-700 mb-0.5">Free</p>
          <p className="text-[22px] font-display font-bold text-neutral-900 mb-3">$0</p>
          <ul className="space-y-1.5">
            {PLAN_FEATURES.free.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-neutral-600">
                <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="relative border-2 border-[#1A1918] rounded-2xl p-4 bg-[#1A1918]">
          <span className="absolute -top-2.5 left-3 text-[10px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full tracking-widest uppercase">
            PRO
          </span>
          <p className="text-[13px] font-semibold text-neutral-300 mb-0.5">Pro</p>
          <p className="text-[22px] font-display font-bold text-white mb-3">
            $9
            <span className="text-[13px] font-normal text-neutral-400">/mo</span>
          </p>
          <ul className="space-y-1.5">
            {PLAN_FEATURES.pro.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px] text-neutral-300">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 w-full justify-center btn-pill-dark"
      >
        <img src="/icons/iconsax-crown-d811f1fd55ed-.svg" alt="" className="w-4 h-4" />
        Upgrade to Pro
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-sm p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-display text-[18px] font-semibold text-neutral-900 mb-2">Coming soon</h3>
            <p className="text-[13.5px] text-neutral-500 mb-5">
              Pro plan is in development. Leave your email and we&apos;ll notify you when it launches.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full btn-pill-dark"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Preview section ───────────────────────────────────────────────────────────

function PreviewSection({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  const previewProfile = {
    id:                 profile.id,
    full_name:          profile.full_name ?? null,
    avatar_url:         profile.avatar_url ?? null,
    bio:                profile.bio ?? null,
    motivation:         profile.motivation ?? null,
    location:           profile.location ?? null,
    role:               profile.role ?? null,
    status:             profile.status ?? null,
    availability_hours: profile.availability_hours ?? null,
    is_open_to_match:   profile.is_open_to_match ?? null,
    is_verified:        false,
    portfolio_url:      profile.portfolio_url ?? null,
    github_url:         profile.github_url ?? null,
    profile_skills:     profile.profile_skills ?? [],
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        label="Profile preview"
        sub="How your card looks to other people on behuddle."
      />

      <div className="flex items-start justify-center py-4">
        <ProfileCardPopup profile={previewProfile} />
      </div>

      <p className="text-[12.5px] text-neutral-400 text-center">
        Update your profile in the <strong className="text-neutral-600">Profile</strong> tab to change this card.
      </p>
    </div>
  );
}

// ── Account section ───────────────────────────────────────────────────────────

function AccountSection({ email, profile }: { email: string; profile: Profile | null }) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [emailDigestOptIn, setEmailDigestOptIn] = useState(profile?.email_digest_opt_in ?? true);
  const [isPending, start] = useTransition();

  const handleLogout = () => {
    start(async () => { await logout(); });
  };

  const handleDigestToggle = () => {
    const newValue = !emailDigestOptIn;
    setEmailDigestOptIn(newValue);
    start(async () => {
      await updateProfile({ email_digest_opt_in: newValue });
    });
  };

  return (
    <div className="space-y-5">
      <SectionHeader label="Account" />

      {/* Email */}
      <div className="space-y-1.5">
        <p className="text-[12.5px] font-medium text-neutral-600">Email address</p>
        <div className="flex items-center gap-3 bg-white border border-neutral-300 rounded-2xl px-3.5 py-2.5">
          <p className="text-[13.5px] text-neutral-700 flex-1">{email}</p>
          <span className="text-[11px] bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full">verified</span>
        </div>
      </div>

      {/* Weekly digest toggle */}
      <div className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl">
        <div>
          <p className="text-[13.5px] font-medium text-neutral-800">Weekly digest</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">Get a summary of your top matches each week</p>
        </div>
        <button
          type="button"
          onClick={handleDigestToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 shrink-0 ${
            emailDigestOptIn ? 'bg-emerald-500' : 'bg-neutral-200'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          role="switch"
          aria-checked={emailDigestOptIn}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              emailDigestOptIn ? 'translate-x-[22px]' : 'translate-x-[2px]'
            }`}
          />
        </button>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2.5 text-[13.5px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
      >
        <img src="/icons/logout-02.svg" alt="" className="w-4 h-4 brightness-0 opacity-40" />
        {isPending ? "Signing out…" : "Sign out"}
      </button>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-2xl p-5 bg-red-50/40">
        <p className="text-[13px] font-semibold text-red-700 mb-1">Danger zone</p>
        <p className="text-[12.5px] text-red-600/70 mb-4">
          Deleting your account is permanent. All matches, messages, and projects will be removed.
        </p>
        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-full border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <img src="/icons/trash-square.svg" alt="" className="w-4 h-4" style={{ filter: "invert(35%) sepia(80%) saturate(500%) hue-rotate(320deg)" }} />
            Delete account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-[12.5px] text-red-700">Type <strong>delete my account</strong> to confirm.</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-red-200 bg-white rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
              placeholder="delete my account"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowDelete(false); setConfirmText(""); }}
                className="text-[12.5px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== "delete my account"}
                className="text-[12.5px] font-medium px-4 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirm deletion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",  label: "Profile" },
  { id: "preview",  label: "Preview" },
  { id: "plan",     label: "Plan" },
  { id: "account",  label: "Account" },
];

export default function SettingsClient({ profile, email, allSkills }: Props) {
  const [tab, setTab] = useState("profile");

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto pt-4 pb-12">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Settings</h1>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 bg-[#e2ddd8] rounded-2xl p-1 mb-7">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 text-[12.5px] font-medium px-3 py-2 rounded-xl transition-all duration-200 ${
                tab === t.id
                  ? "bg-white text-[#1A1918] shadow-[0_2px_8px_rgba(26,25,24,0.10)]"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content — no exit animation to prevent height-collapse jump */}
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "profile"  && <ProfileSection profile={profile} allSkills={allSkills} />}
          {tab === "preview"  && <PreviewSection profile={profile} />}
          {tab === "plan"     && <SubscriptionSection />}
          {tab === "account"  && <AccountSection email={email} profile={profile} />}
        </motion.div>
      </div>
    </div>
  );
}
