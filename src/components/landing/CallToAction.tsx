"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.23, 1, 0.32, 1] as const;

export function CallToAction() {
  return (
    <section className="relative py-36 px-6 w-full bg-background">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage/30 to-transparent" />

      {/* Decorative large ampersand */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none select-none absolute right-[2%] bottom-0
                   font-display font-bold leading-none text-sage/[0.05]"
        style={{ fontSize: "clamp(180px, 22vw, 340px)" }}
      >
        &amp;
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center md:text-left"
        >
          <h2 className="font-display text-[clamp(2rem,5vw+0.5rem,3.5rem)] font-semibold text-heading leading-[1.2] mb-6 overflow-visible">
            Find your <span className="font-serif italic text-foreground font-normal">co-founder</span> today.
          </h2>
          <p className="font-sans text-[1.05rem] text-secondary leading-relaxed max-w-md mx-auto md:mx-0">
            Stop waiting for the perfect moment. The right person is probably looking for someone just like you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center md:items-end gap-5 shrink-0"
        >
          <Link href="/login" className="btn-pill-dark !px-9 !py-3 text-base">
            Get early access
          </Link>
          <p className="text-sm text-hint leading-relaxed">
            Still building —<br className="hidden sm:block" /> but people are already finding each other.
          </p>
        </motion.div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage/30 to-transparent" />
    </section>
  );
}
