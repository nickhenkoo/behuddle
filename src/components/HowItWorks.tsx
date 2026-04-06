"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    number: "01",
    title: "Tell your story",
    body: "Describe yourself — your idea, your skills, what you're looking for. No résumé needed.",
    icon: "✦",
  },
  {
    number: "02",
    title: "Find your match",
    body: "Browse people who are actively looking for someone like you. Idea people meet builders, builders meet ideas.",
    icon: "◎",
  },
  {
    number: "03",
    title: "Message. Meet. Build.",
    body: "Start a conversation. If it clicks — ship something together.",
    icon: "→",
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

function Step({
  step,
  index,
  isLast,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.14, ease }}
      className="relative flex gap-8 md:gap-12"
    >
      {/* Left column: number + vertical connector */}
      <div className="flex flex-col items-center gap-0 shrink-0">
        {/* Step badge */}
        <div
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-black/12
                     bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                     flex items-center justify-center shrink-0"
        >
          <span className="font-display text-[0.7rem] font-semibold tracking-[0.16em] text-neutral-400 tabular-nums">
            {step.number}
          </span>
        </div>

        {/* Connector line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: index * 0.14 + 0.3, ease }}
            style={{ transformOrigin: "top" }}
            className="w-px flex-1 min-h-[52px] bg-gradient-to-b from-black/15 to-transparent mt-2"
          />
        )}
      </div>

      {/* Right column: content */}
      <div className="pb-14 min-w-0">
        <h3 className="font-display text-[clamp(1.2rem,2.5vw+0.3rem,1.65rem)] font-semibold text-black tracking-tight mb-2">
          {step.title}
        </h3>

        <p className="font-sans text-[0.9rem] text-neutral-500 leading-relaxed max-w-sm">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-32 px-6 w-full bg-background overflow-hidden"
    >
      {/* Thin rules */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      {/* Decorative large number — subtle parallax */}
      <motion.div
        aria-hidden
        className="pointer-events-none select-none absolute left-[52%] top-1/2 -translate-y-1/2
                   font-display font-bold leading-none text-black/[0.025]"
        style={{ fontSize: "clamp(200px, 24vw, 360px)", y: bgY }}
      >
        03
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header row */}
        <div className="flex items-end justify-between mb-20 flex-wrap gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-neutral-400 mb-3">
              The process
            </p>
            <h2 className="font-display text-[clamp(1.75rem,4vw+0.5rem,3rem)] font-semibold tracking-tight text-black">
              How it works
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="text-sm text-neutral-400 max-w-[200px] leading-relaxed text-right"
          >
            Three steps.<br />No fluff.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="max-w-lg">
          {STEPS.map((step, i) => (
            <Step key={step.number} step={step} index={i} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
