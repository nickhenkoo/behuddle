"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, ensureSkills } from "@/lib/supabase/actions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Skill {
  id: number;
  name: string;
  category: string | null;
}

interface FormState {
  role: "builder" | "contributor" | null;
  skill_ids: number[];
  bio: string;
  motivation: string;
  status: string;
  availability_hours: number;
}

// ── Static data ───────────────────────────────────────────────────────────────

const STATUSES = [
  { value: "open",                 label: "Open to match",        desc: "Ready to meet people now" },
  { value: "looking_for_designer", label: "Looking for designer", desc: "Specifically need design help" },
  { value: "busy",                 label: "Busy right now",       desc: "Building — check back later" },
  { value: "away",                 label: "Away",                 desc: "Not available at the moment" },
];

const AVAILABILITY = [5, 10, 20, 40];

const CATEGORIES = ["engineering", "design", "business", "marketing", "other"];

// ── Steps ─────────────────────────────────────────────────────────────────────

function StepRole({ value, onChange }: { value: string | null; onChange: (v: "builder" | "contributor") => void }) {
  return (
    <div className="space-y-3">
      {(["builder", "contributor"] as const).map((role) => {
        const active = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white text-neutral-700"
            }`}
          >
            <div className="font-medium text-[14px] capitalize">{role}</div>
            <div className={`text-[12.5px] mt-0.5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
              {role === "builder"
                ? "I have an idea and need people to build it with"
                : "I have skills and want to join something being built"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepSkills({
  skills,
  value,
  onChange,
  customSkills,
  onCustomSkills,
}: {
  skills: Skill[];
  value: number[];
  onChange: (ids: number[]) => void;
  customSkills: string[];
  onCustomSkills: (names: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  const addCustom = () => {
    const name = input.trim();
    if (!name || customSkills.includes(name)) { setInput(""); return; }
    onCustomSkills([...customSkills, name]);
    setInput("");
  };

  const removeCustom = (name: string) =>
    onCustomSkills(customSkills.filter((s) => s !== name));

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat);
        if (!catSkills.length) return null;
        return (
          <div key={cat}>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {catSkills.map((skill) => {
                const active = value.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggle(skill.id)}
                    className={`text-[12.5px] px-3 py-1.5 rounded-lg border transition-all duration-100 ${
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

      {/* Custom skills */}
      <div>
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2">custom</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {customSkills.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1 text-[12.5px] px-3 py-1.5 rounded-lg border border-neutral-900 bg-neutral-900 text-white"
            >
              {name}
              <button
                type="button"
                onClick={() => removeCustom(name)}
                className="ml-0.5 text-neutral-400 hover:text-white transition-colors leading-none"
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
            placeholder="Type a skill and press Enter"
            maxLength={40}
            className="flex-1 bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-lg px-3 py-1.5 text-[12.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!input.trim()}
            className="text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:border-neutral-300 text-neutral-600 disabled:opacity-40 transition-all duration-100"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function StepBio({
  bio, motivation, onBio, onMotivation,
}: {
  bio: string; motivation: string; onBio: (v: string) => void; onMotivation: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          Short bio <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBio(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Who you are, what you've built, what drives you…"
          className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150 resize-none"
        />
        <p className="text-[11.5px] text-neutral-400 text-right">{bio.length}/280</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          Why are you here? <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={motivation}
          onChange={(e) => onMotivation(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="What are you hoping to find or build on behuddle?"
          className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150 resize-none"
        />
      </div>
    </div>
  );
}

function StepStatus({
  status, hours, location, onStatus, onHours, onLocation,
}: {
  status: string; hours: number; location: string;
  onStatus: (v: string) => void; onHours: (v: number) => void; onLocation: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-neutral-600">Current status</p>
        {STATUSES.map((s) => {
          const active = status === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onStatus(s.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-100 ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 text-neutral-600"
              }`}
            >
              <span className="text-[13px] font-medium">{s.label}</span>
              <span className={`text-[12px] ml-2 ${active ? "text-neutral-300" : "text-neutral-400"}`}>
                — {s.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-neutral-600">Hours available per week</p>
        <div className="flex gap-2">
          {AVAILABILITY.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHours(h)}
              className={`flex-1 py-2 rounded-lg border text-[13px] font-medium transition-all duration-100 ${
                hours === h
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 text-neutral-600"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-neutral-600">
          City <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          placeholder="e.g. Berlin, Tokyo, Remote"
          className="w-full bg-neutral-50 hover:bg-white border border-neutral-200 hover:border-neutral-300 focus:bg-white focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 text-[13.5px] text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150"
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Who are you?",     sub: "Choose the role that fits you best." },
  { id: 2, title: "What can you do?", sub: "Pick all skills that apply. You can change these later." },
  { id: 3, title: "Tell your story",  sub: "Help people understand who they'll be working with." },
  { id: 4, title: "Last thing",       sub: "Set your availability and status." },
];

const variants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

export default function OnboardingClient({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    role: null,
    skill_ids: [],
    bio: "",
    motivation: "",
    status: "open",
    availability_hours: 10,
  });

  const total = STEPS.length;

  const canProceed = () => step !== 1 || form.role !== null;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      // Insert any custom skills into the DB first, get their IDs
      const customIds = customSkills.length ? await ensureSkills(customSkills) : [];

      const result = await updateProfile({
        role: form.role ?? undefined,
        bio: form.bio || undefined,
        motivation: form.motivation || undefined,
        status: form.status,
        availability_hours: form.availability_hours,
        is_open_to_match: true,
        skill_ids: [...form.skill_ids, ...customIds],
        ...(location ? { location } : {}),
      });
      if (!result?.success) { setError('error' in result ? result.error : 'Failed'); return; }
      router.push("/dashboard");
    });
  };

  const currentStep = STEPS[step - 1];

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-neutral-400">Step {step} of {total}</span>
            <span className="text-[12px] text-neutral-400">{Math.round((step / total) * 100)}%</span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neutral-900 rounded-full"
              animate={{ width: `${(step / total) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
            <motion.h1
              key={`title-${step}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-[22px] font-semibold tracking-tight text-neutral-900"
            >
              {currentStep.title}
            </motion.h1>
            <motion.p
              key={`sub-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="text-[13px] text-neutral-500 mt-1"
            >
              {currentStep.sub}
            </motion.p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 min-h-[280px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 1 && <StepRole value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />}
                {step === 2 && <StepSkills skills={skills} value={form.skill_ids} onChange={(ids) => setForm((f) => ({ ...f, skill_ids: ids }))} customSkills={customSkills} onCustomSkills={setCustomSkills} />}
                {step === 3 && (
                  <StepBio
                    bio={form.bio} motivation={form.motivation}
                    onBio={(v) => setForm((f) => ({ ...f, bio: v }))}
                    onMotivation={(v) => setForm((f) => ({ ...f, motivation: v }))}
                  />
                )}
                {step === 4 && (
                  <StepStatus
                    status={form.status} hours={form.availability_hours} location={location}
                    onStatus={(v) => setForm((f) => ({ ...f, status: v }))}
                    onHours={(v) => setForm((f) => ({ ...f, availability_hours: v }))}
                    onLocation={setLocation}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100">
            {error && (
              <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              {step > 1 ? (
                <button type="button" onClick={() => go(step - 1)} className="text-[13px] text-neutral-500 hover:text-neutral-700 transition-colors px-2">
                  ← Back
                </button>
              ) : <div />}

              {step < total ? (
                <button
                  type="button"
                  onClick={() => go(step + 1)}
                  disabled={!canProceed()}
                  className="bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={isPending}
                  className="bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white text-[13.5px] font-medium rounded-xl px-5 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Saving…
                    </span>
                  ) : "Go to dashboard →"}
                </button>
              )}
            </div>
          </div>
        </div>

        {step < total && (
          <p className="mt-4 text-center">
            <button type="button" onClick={save} className="text-[12.5px] text-neutral-400 hover:text-neutral-600 transition-colors">
              Skip for now
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
