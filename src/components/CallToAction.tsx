"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.23, 1, 0.32, 1] as const;

export function CallToAction() {
  return (
    <section className="relative py-36 px-6 w-full bg-background overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      {/* Decorative large ampersand */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none select-none absolute right-[2%] bottom-0
                   font-display font-bold leading-none text-black/[0.03]"
        style={{ fontSize: "clamp(180px, 22vw, 340px)" }}
      >
        &amp;
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
          className="text-xs font-medium tracking-[0.18em] uppercase text-neutral-400 mb-8"
        >
          Ready to start
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="font-display text-[clamp(2rem,5.5vw+0.5rem,4.5rem)]
                     font-bold tracking-tight text-black leading-[1.05] mb-14 max-w-2xl"
        >
          Find your<br />
          <span className="text-neutral-300">co-founder today.</span>
        </motion.h2>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.18, ease }}
          className="flex flex-wrap items-center gap-6"
        >
          <Link href="/login" className="btn-pill-dark !px-9 !py-3 text-base">
            Get early access
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Still building —<br className="hidden sm:block" /> but people are already finding each other.
          </p>
        </motion.div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
    </section>
  );
}
