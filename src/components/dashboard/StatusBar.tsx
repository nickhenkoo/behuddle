"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/supabase/actions";

const STATUSES = [
  { value: "open",                 label: "Open",                color: "bg-emerald-500" },
  { value: "looking_for_designer", label: "Need designer",       color: "bg-indigo-500" },
  { value: "busy",                 label: "Busy",                color: "bg-amber-500" },
  { value: "away",                 label: "Away",                color: "bg-neutral-400" },
];

interface Props {
  profile: { id: string; status?: string | null; full_name?: string | null };
}

export function StatusBar({ profile }: Props) {
  const [status, setStatus] = useState(profile.status ?? "open");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  const handleChange = (value: string) => {
    setStatus(value);
    setOpen(false);
    startTransition(async () => {
      await updateProfile({ status: value });
    });
  };

  return (
    <div className="flex items-center justify-between bg-white border border-neutral-200/80 rounded-xl px-4 py-3">
      <span className="text-[13px] text-neutral-500">Your status</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={isPending}
          className="flex items-center gap-2 text-[13.5px] font-medium text-neutral-800 hover:text-neutral-900 transition-colors disabled:opacity-60"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${current.color}`} />
          {current.label}
          <span className="text-neutral-400 text-[11px]">▾</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-20">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleChange(s.value)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-left transition-colors ${
                  s.value === status
                    ? "bg-neutral-50 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
