"use client";

import { useState, useTransition } from "react";
import { updateProfile, logout } from "@/lib/supabase/actions";
import { Check, Zap, Crown, Sparkles, Trash2, LogOut } from "lucide-react";
import { ProfileCardPopup } from "@/components/dashboard/ProfileCard";

// ── Types ────────────────────────────────────────────────────────────────────

interface Skill { id: number; name: string; category: string | null; }

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  motivation?: string | null;
  location?: string | null;
  role?: string | null;
  status?: string | null;
  availability_hours?: number | null;
  is_open_to_match?: boolean | null;
  email_digest_opt_in?: boolean | null;
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

function Divider() {
  return <div className="h-px bg-neutral-100 my-8" />;
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

const inputCls = "w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150";

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
  const [location, setLoc]    = useState(profile?.location ?? "");
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
        bio:              bio || undefined,
        motivation:       motivation || undefined,
        location:         location || undefined,
        skill_ids:        skillIds,
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
              className={`py-3 px-4 text-left rounded-xl border transition-all duration-100 ${
                role === r
                  ? "bg-neutral-900 border-neutral-900 text-white"
                  : "bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-600"
              }`}
            >
              <p className="text-[13px] font-medium capitalize">{r}</p>
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

      <Field label="City" hint="optional">
        <input type="text" value={location} onChange={(e) => setLoc(e.target.value)}
          placeholder="e.g. Berlin, Tokyo, Remote" className={inputCls} />
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
                        className={`text-[12px] px-2.5 py-1 rounded-lg border transition-all duration-100 ${
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 text-neutral-600"
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
        className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
      >
        {saved
          ? <><Check className="w-4 h-4" /> Saved</>
          : isPending ? "Saving…" : "Save changes"
        }
      </button>
    </div>
  );
}

// ── Appearance section ────────────────────────────────────────────────────────

const ACCENTS = [
  { name: "Indigo",  value: "indigo",  cls: "bg-indigo-500" },
  { name: "Emerald", value: "emerald", cls: "bg-emerald-500" },
  { name: "Rose",    value: "rose",    cls: "bg-rose-500" },
  { name: "Amber",   value: "amber",   cls: "bg-amber-500" },
  { name: "Slate",   value: "slate",   cls: "bg-slate-600" },
];

function AppearanceSection() {
  const [accent, setAccent] = useState("indigo");
  const [compact, setCompact] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader label="Appearance" sub="Visual preferences — stored locally in your browser." />

      <div>
        <p className="text-[12.5px] font-medium text-neutral-600 mb-3">Accent colour</p>
        <div className="flex items-center gap-2.5">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAccent(a.value)}
              title={a.name}
              className={`relative w-7 h-7 rounded-full ${a.cls} transition-transform ${accent === a.value ? "scale-110 ring-2 ring-offset-2 ring-neutral-400" : "opacity-60 hover:opacity-100"}`}
            >
              {accent === a.value && (
                <Check className="absolute inset-0 m-auto w-3.5 h-3.5 text-white" />
              )}
            </button>
          ))}
        </div>
        <p className="text-[11.5px] text-neutral-400 mt-2">Full theme support coming soon.</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13.5px] font-medium text-neutral-800">Compact mode</p>
          <p className="text-[12.5px] text-neutral-500">Reduce spacing for more content density</p>
        </div>
        <button
          type="button"
          onClick={() => setCompact((v) => !v)}
          className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${compact ? "bg-neutral-900" : "bg-neutral-200"}`}
          role="switch"
          aria-checked={compact}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${compact ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      </div>
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
      <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-neutral-500" />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-neutral-900">Free</p>
          <p className="text-[12px] text-neutral-500">Current plan</p>
        </div>
      </div>

      {/* Plans comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Free */}
        <div className="border border-neutral-200 rounded-xl p-4">
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
        <div className="relative border-2 border-neutral-900 rounded-xl p-4 bg-neutral-900">
          <span className="absolute -top-2.5 left-3 text-[10px] font-semibold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
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
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 w-full justify-center bg-neutral-900 hover:bg-neutral-800 text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all active:scale-[0.99]"
      >
        <Crown className="w-4 h-4" />
        Upgrade to Pro
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="font-display text-[18px] font-semibold text-neutral-900 mb-2">Coming soon</h3>
            <p className="text-[13.5px] text-neutral-500 mb-5">
              Pro plan is in development. Leave your email and we&apos;ll notify you when it launches.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full bg-neutral-900 text-white text-[13.5px] font-medium rounded-xl py-2.5 hover:bg-neutral-800 transition-colors"
            >
              Got it
            </button>
          </div>
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

      <div className="space-y-1.5">
        <p className="text-[12.5px] font-medium text-neutral-600">Email address</p>
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5">
          <p className="text-[13.5px] text-neutral-700 flex-1">{email}</p>
          <span className="text-[11px] bg-neutral-200 text-neutral-500 font-medium px-2 py-0.5 rounded-full">verified</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
        <div>
          <p className="text-[12.5px] font-medium text-neutral-600">Weekly digest</p>
          <p className="text-[11.5px] text-neutral-500 mt-0.5">Get a summary of your top matches each week</p>
        </div>
        <button
          type="button"
          onClick={handleDigestToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
            emailDigestOptIn ? 'bg-indigo-600' : 'bg-neutral-300'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              emailDigestOptIn ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div>
        <p className="text-[12.5px] font-medium text-neutral-600 mb-1.5">Password</p>
        <button
          type="button"
          className="text-[13.5px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Send password reset email →
        </button>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2 text-[13.5px] font-medium text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        {isPending ? "Signing out…" : "Sign out"}
      </button>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-xl p-4 bg-red-50/50">
        <p className="text-[13px] font-semibold text-red-700 mb-1">Danger zone</p>
        <p className="text-[12.5px] text-red-600/80 mb-3">
          Deleting your account is permanent. All matches, messages, and projects will be removed.
        </p>
        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete account
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[12.5px] text-red-700">Type <strong>delete my account</strong> to confirm.</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-red-200 bg-white rounded-lg px-3 py-2 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder="delete my account"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowDelete(false); setConfirmText(""); }}
                className="text-[12.5px] text-neutral-500 hover:text-neutral-700 transition-colors px-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== "delete my account"}
                className="text-[12.5px] font-medium text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
  { id: "profile",      label: "Profile" },
  { id: "preview",      label: "Preview" },
  { id: "appearance",   label: "Appearance" },
  { id: "plan",         label: "Plan" },
  { id: "account",      label: "Account" },
];

export default function SettingsClient({ profile, email, allSkills }: Props) {
  const [tab, setTab] = useState("profile");

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-neutral-900">Settings</h1>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-1 mb-7">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${
                tab === t.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "profile"    && <ProfileSection profile={profile} allSkills={allSkills} />}
        {tab === "preview"    && <PreviewSection profile={profile} />}
        {tab === "appearance" && <AppearanceSection />}
        {tab === "plan"       && <SubscriptionSection />}
        {tab === "account"    && <AccountSection email={email} profile={profile} />}
      </div>
    </div>
  );
}
