"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LINES = [
  {
    text: "Many people have an idea that lives in their head for years.",
    accent: false,
  },
  {
    text: "Not because it's a bad idea —",
    accent: false,
  },
  {
    text: "but because they haven't found the right person to build it with.",
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
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 1.2,
        delay: index * 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`relative ${large ? "mt-12" : "mt-4"}`}
    >
      <span
        className={`
          block leading-[1.3]
          ${large
            ? "font-serif italic text-[clamp(2.5rem,6vw+0.5rem,4.5rem)] text-sage-dark tracking-tight"
            : accent
            ? "font-display text-[clamp(1.2rem,3vw+0.3rem,1.8rem)] font-medium text-foreground"
            : "font-sans text-[clamp(1.1rem,2.5vw+0.3rem,1.5rem)] font-light text-secondary"
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
      className="relative py-48 px-6 w-full bg-background"
    >
      {/* ── Decorative oversized quote mark ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none select-none absolute top-16 left-10 text-[24rem] font-serif text-sage/5 leading-none"
        style={{ y: quoteY, willChange: "transform" }}
      >
        “
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-2xl mx-auto text-center md:text-left">

        {/* Small label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-xs font-sans font-medium tracking-[0.18em] uppercase
                     text-hint mb-10"
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
          className="mt-16 h-px w-16 bg-sage-dark"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.75, ease: "easeOut" }}
          className="mt-4 text-[0.78rem] font-sans text-hint tracking-wide"
        >
          — behuddle
        </motion.p>
      </div>
    </section>
  );
}
