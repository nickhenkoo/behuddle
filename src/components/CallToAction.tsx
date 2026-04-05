"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CallToAction() {
  return (
    <section className="py-24 px-4 w-full bg-background border-b border-black/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto flex flex-col items-center text-center"
      >
        <h2 className="font-display text-[clamp(1.75rem,4vw+0.5rem,3rem)] font-semibold tracking-tight text-black mb-10">
          Ready to find your match?
        </h2>

        <Link href="/login" className="brutal-btn-dark">
          Get early access
        </Link>
        <p className="mt-8 text-neutral-500 text-sm tracking-wide">
          Still building — but people are already finding each other.
        </p>
      </motion.div>
    </section>
  );
}
