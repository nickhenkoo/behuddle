"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex flex-col justify-center min-h-[95vh] overflow-hidden bg-background pt-20">

      {/* Decorative: large muted background character — visible asymmetric anchor */}
      <div className="absolute right-[-2%] top-1/2 -translate-y-[55%] font-display font-bold text-[28vw] text-black/[0.03] leading-none select-none pointer-events-none hidden md:block">
        &amp;
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-[clamp(2.25rem,6vw+1rem,4.5rem)] font-semibold tracking-tight text-black max-w-2xl leading-[1.1]"
        >
          <span className="text-neutral-400">You have an idea.</span><br />
          Someone has the hands.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-base text-neutral-500 max-w-sm font-light leading-relaxed"
        >
          From concept to creation — find the person who turns your idea into something real.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10"
        >
          <Link href="#two-doors" className="btn-pill-dark inline-block !px-9 !py-3">
            Find a companion
          </Link>
        </motion.div>
      </div>


    </section>
  );
}
