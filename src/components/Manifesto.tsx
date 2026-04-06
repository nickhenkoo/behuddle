"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LINES = [
  {
    text: "Many people have an idea that lives in their head for years.",
    accent: false,
  },
  {
    text: "Not because it's bad —",
    accent: false,
  },
  {
    text: "but because they have no one to build it with.",
    accent: true,
  },
  {
    text: "That's what we are about.",
    accent: true,
    large: true,
  },
];

function RevealLine({
  text,
  accent,
  large,
  index,
}: {
  text: string;
  accent?: boolean;
  large?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`relative overflow-hidden ${large ? "mt-10" : "mt-3"}`}
    >
      <span
        className={`
          font-display block leading-tight
          ${large
            ? "text-[clamp(2rem,5vw+0.5rem,4rem)] font-bold tracking-tight text-black"
            : accent
            ? "text-[clamp(1.1rem,2.5vw+0.3rem,1.6rem)] font-medium text-black"
            : "text-[clamp(1rem,2vw+0.3rem,1.35rem)] font-light text-neutral-500"
          }
        `}
      >
        {text}
      </span>
    </motion.div>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Slow parallax on the large decorative quote mark
  const quoteY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative py-36 px-6 w-full overflow-hidden bg-background"
    >
      {/* ── Thin full-width rule above ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.07]" />

      {/* ── Decorative oversized quote mark ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none select-none absolute right-[4%] top-1/2 -translate-y-1/2
                   font-display font-bold leading-none text-black/[0.035]"
        style={{ fontSize: "clamp(240px, 28vw, 420px)", y: quoteY }}
      >
        &ldquo;
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Small label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-xs font-sans font-medium tracking-[0.18em] uppercase
                     text-neutral-400 mb-10"
        >
          Our belief
        </motion.p>

        {/* Lines */}
        <div>
          {LINES.map((line, i) => (
            <RevealLine key={i} index={i} {...line} />
          ))}
        </div>

        {/* Signature line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: "left" }}
          className="mt-16 h-px w-16 bg-black"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.75, ease: "easeOut" }}
          className="mt-4 text-[0.78rem] font-sans text-neutral-400 tracking-wide"
        >
          — behuddle
        </motion.p>
      </div>

      {/* ── Thin full-width rule below ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/[0.07]" />
    </section>
  );
}
