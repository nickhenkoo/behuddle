"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface DoorProps {
  label: string;
  cta: string;
  ctaHref: string;
  originSide: "left" | "right";
  delay: number;
}

function Door({ label, cta, ctaHref, originSide, delay }: DoorProps) {
  const [opened, setOpened] = useState(false);

  const openAngle = originSide === "left" ? 42 : -42;
  const knobClass = originSide === "left" ? "right-4" : "left-4";
  const borderClass = originSide === "left" ? "border-r-2" : "border-l-2";
  const transformOrigin = originSide === "left" ? "left center" : "right center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="relative w-full max-w-[360px] aspect-[1/1.8]"
      style={{ perspective: "1000px" }}
    >
      {/* Door Frame */}
      <div className="absolute inset-0 border-[8px] border-black rounded-t-lg bg-neutral-100 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">

        {/* Content revealed behind the door */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8"
          animate={{ opacity: opened ? 1 : 0 }}
          transition={{ delay: opened ? 0.3 : 0, duration: 0.25 }}
          style={{ pointerEvents: opened ? "auto" : "none" }}
        >
          <Link href={ctaHref} className="brutal-btn-dark text-sm">
            {cta}
          </Link>
          <button
            onClick={() => setOpened(false)}
            className="text-xs text-neutral-400 hover:text-black transition-colors"
          >
            ← close door
          </button>
        </motion.div>

        {/* The Door panel — rotates on click/keyboard */}
        <motion.div
          role="button"
          tabIndex={opened ? -1 : 0}
          aria-label={label}
          className={`absolute inset-0 bg-white ${borderClass} border-black cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2`}
          style={{ transformOrigin }}
          animate={{ rotateY: opened ? openAngle : 0 }}
          whileHover={{ rotateY: opened ? openAngle : (originSide === "left" ? 14 : -14) }}
          transition={{
            type: "spring",
            stiffness: opened ? 90 : 220,
            damping: opened ? 18 : 28,
          }}
          onClick={() => setOpened(true)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !opened) {
              e.preventDefault();
              setOpened(true);
            }
          }}
        >
          {/* Door panels (decorative insets) */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-2/3 h-1/3 border-2 border-neutral-100 rounded-sm" />
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-2/3 h-[40%] border-2 border-neutral-100 rounded-sm" />

          {/* Doorknob */}
          <div className={`absolute ${knobClass} top-1/2 w-4 h-4 bg-black rounded-full border border-neutral-700 shadow-sm`} />

          {/* Door text — fades out as door opens */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-8 text-center"
            animate={{ opacity: opened ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          >
            <p className="font-display text-xl md:text-2xl font-medium text-black leading-snug">
              {label}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function TwoDoors() {
  return (
    <section id="two-doors" className="py-24 px-4 w-full max-w-5xl mx-auto bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-[clamp(1.75rem,4vw+0.5rem,3rem)] font-semibold tracking-tight text-black">
          Who are you?
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-24 w-full place-items-center">
        <Door
          label='"I have an idea, but no time or skills to build it"'
          cta="I have an idea →"
          ctaHref="/login"
          originSide="left"
          delay={0.2}
        />
        <Door
          label='"I know how to build, but I want to work on something of my own"'
          cta="I want to build →"
          ctaHref="/login"
          originSide="right"
          delay={0.4}
        />
      </div>
    </section>
  );
}
