"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/supabase/actions";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const STATUSES = [
  { value: "open",                 label: "Open",                color: "bg-emerald-500", ring: "ring-emerald-500/20" },
  { value: "looking_for_designer", label: "Need designer",       color: "bg-indigo-500", ring: "ring-indigo-500/20" },
  { value: "busy",                 label: "Busy",                color: "bg-amber-500", ring: "ring-amber-500/20" },
  { value: "away",                 label: "Away",                color: "bg-neutral-400", ring: "ring-neutral-400/20" },
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
    <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3.5 shadow-[0_2px_12px_rgba(26,25,24,0.03)] border border-black/[0.02]">
      <span className="text-[13px] font-medium text-neutral-500 tracking-wide">Current Status</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={isPending}
          className={`flex items-center gap-2.5 text-[14px] font-medium text-[#1A1918] transition-all disabled:opacity-60 bg-[#f6f5f4] hover:bg-black/[0.04] px-3 py-1.5 rounded-xl ${isPending ? "animate-pulse" : ""}`}
        >
          <span className={`relative flex h-2.5 w-2.5`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${current.color}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${current.color}`}></span>
          </span>
          {current.label}
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-black/[0.06] rounded-[16px] shadow-[0_8px_32px_rgba(26,25,24,0.08)] overflow-hidden z-20 py-1"
            >
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleChange(s.value)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors relative ${
                    s.value === status
                      ? "text-[#1A1918] font-semibold bg-black/[0.02]"
                      : "text-neutral-500 hover:text-[#1A1918] hover:bg-black/[0.02]"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color} ring-4 ${s.ring}`} />
                  {s.label}
                  {s.value === status && (
                    <motion.div layoutId="status-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-r-full bg-sage-light" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
