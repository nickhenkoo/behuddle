"use client";

import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <section id="manifesto" className="py-32 px-4 w-full relative bg-neutral-100 border-y border-black/10">
      <div className="max-w-4xl mx-auto text-center bg-white p-12 md:p-20 rounded-2xl border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <p className="font-display text-[clamp(1.2rem,2.5vw+0.5rem,1.75rem)] text-neutral-800 font-normal leading-relaxed md:leading-loose">
            Many people have an idea that lives in their head for years.<br />
            Not because it is bad — but <span className="text-black font-semibold">because they have no one to build it with.</span><br />
            <span className="text-black font-bold mt-4 inline-block">That's what we are about.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
