"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DOOR_W = 200;
const DOOR_H = 310;
const ARCH_R = `${DOOR_W / 2}px ${DOOR_W / 2}px 10px 10px`;
const PERSPECTIVE = 1400;

// ─── Telegram-style Speech Bubble ─────────────────────────────────────────────
// Tail is at the bottom-corner closest to the door (bottom-right for left bubble,
// bottom-left for right bubble), just like Telegram received messages.
function TelegramBubble({
  text,
  side,
}: {
  text: string;
  side: "left" | "right";
}) {
  // For left bubble: tail pokes out bottom-right → toward the door on the right
  // For right bubble: tail pokes out bottom-left → toward the door on the left
  const tailRight = side === "left";

  return (
    <div
      className="relative flex-1"
      style={{ minWidth: 170, maxWidth: 230 }}
    >
      {/* Bubble body */}
      <div
        className="relative px-5 py-4 w-full"
        style={{
          background: "#F0F0F0",
          borderRadius: tailRight
            ? "18px 18px 4px 18px"   // bottom-right is sharp (where tail is)
            : "18px 18px 18px 4px",  // bottom-left is sharp
        }}
      >
        <p className="font-sans text-[0.84rem] leading-snug text-neutral-800">
          {text}
        </p>
      </div>

      {/* Tail — small filled triangle at the bottom-corner closest to the door */}
      <svg
        className={`absolute bottom-0 ${tailRight ? "-right-[9px]" : "-left-[9px]"}`}
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        {tailRight ? (
          /* Tail on bottom-right, pointing right */
          <path d="M0 0 L14 14 L0 14 Z" fill="#F0F0F0" />
        ) : (
          /* Tail on bottom-left, pointing left */
          <path d="M14 0 L0 14 L14 14 Z" fill="#F0F0F0" />
        )}
      </svg>
    </div>
  );
}

// ─── Single Door ──────────────────────────────────────────────────────────────
interface DoorProps {
  label: string;
  ctaHref: string;
  side: "left" | "right";
  delay: number;
}

function Door({ label, ctaHref, side, delay }: DoorProps) {
  const [open, setOpen] = useState(false);

  const openAngle = side === "left" ? -80 : 80;
  const transformOrigin = side === "left" ? "0% 50%" : "100% 50%";
  const knobSide = side === "left" ? "right-5" : "left-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay }}
      className="relative flex-shrink-0"
      style={{ width: DOOR_W, height: DOOR_H, perspective: PERSPECTIVE }}
    >
      {/* ── Frame / interior — clickable when open to close ── */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: ARCH_R,
          border: "3px solid rgba(0,0,0,0.75)",
          background: "radial-gradient(ellipse at 50% 25%, #1a1730 0%, #06060e 100%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
          cursor: open ? "pointer" : "default",
        }}
        onClick={() => { if (open) setOpen(false); }}
      >
        {/* Behind-door: revealed content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ delay: open ? 0.28 : 0, duration: 0.22 }}
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          {/* Jump button — stopPropagation so it doesn't close the door */}
          <Link
            href={ctaHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-[0.82rem] font-medium
                       text-white/90 border border-white/20 bg-white/10
                       rounded-2xl px-5 py-2 transition-all duration-150
                       hover:bg-white/20 hover:border-white/35
                       active:scale-[0.96]"
          >
            Jump
          </Link>
        </motion.div>
      </div>

      {/* ── Door panel (rotates on click) ── */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={open ? "Close door" : `Open door: ${label}`}
        aria-pressed={open}
        className="absolute inset-0 cursor-pointer select-none
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-black focus-visible:ring-offset-2"
        style={{
          borderRadius: ARCH_R,
          background: "#ffffff",
          border: "3px solid rgba(0,0,0,0.75)",
          transformOrigin,
          transformStyle: "preserve-3d",
          boxShadow: open ? "none" : "4px 4px 0 rgba(0,0,0,0.12)",
        }}
        animate={{ rotateY: open ? openAngle : 0 }}
        whileHover={!open ? { rotateY: side === "left" ? -14 : 14 } : {}}
        transition={{
          type: "spring",
          stiffness: open ? 60 : 180,
          damping: open ? 16 : 24,
        }}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {/* Decorative arch inset */}
        <div
          className="absolute"
          style={{
            inset: 14,
            borderRadius: `${DOOR_W / 2 - 14}px ${DOOR_W / 2 - 14}px 6px 6px`,
            border: "1.5px solid rgba(0,0,0,0.07)",
          }}
        />

        {/* Doorknob */}
        <div
          className={`absolute ${knobSide} top-[48%] w-3.5 h-3.5 rounded-full
                      bg-neutral-700 border border-neutral-500 shadow-sm`}
        />

        {/* Label — fades out when open */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-7 text-center"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.14 }}
          style={{ pointerEvents: "none" }}
        >
          <p className="font-display text-[0.9rem] font-medium text-black leading-snug">
            {label}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TwoDoors() {
  return (
    <section
      id="two-doors"
      className="py-24 px-6 w-full max-w-5xl mx-auto bg-background"
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="text-center mb-20"
      >
        <h2 className="font-display text-[clamp(1.75rem,4vw+0.5rem,3rem)] font-semibold tracking-tight text-black">
          Who are you?
        </h2>
      </motion.div>

      {/*
        Layout: [left bubble] — gap — [LEFT DOOR][RIGHT DOOR] — gap — [right bubble]
        gap-10 between bubble and door, gap-0 between the two doors
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="flex items-center justify-center w-full"
        style={{ gap: 0 }}
      >
        {/* Left speech bubble */}
        <div className="flex-1 flex justify-end pr-10" style={{ maxWidth: 280 }}>
          <TelegramBubble
            text='"I have an idea, but no time or skills to build it"'
            side="left"
          />
        </div>

        {/* Doors — side by side with breathing room between them */}
        <div className="flex items-center flex-shrink-0" style={{ gap: 24 }}>
          <Door
            label='"I have an idea"'
            ctaHref="/login"
            side="left"
            delay={0.2}
          />
          <Door
            label='"I want to build"'
            ctaHref="/login"
            side="right"
            delay={0.35}
          />
        </div>

        {/* Right speech bubble */}
        <div className="flex-1 flex justify-start pl-10" style={{ maxWidth: 280 }}>
          <TelegramBubble
            text='"I know how to build, but I want to work on something of my own"'
            side="right"
          />
        </div>
      </motion.div>
    </section>
  );
}
