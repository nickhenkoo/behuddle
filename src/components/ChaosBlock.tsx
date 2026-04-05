"use client";

import { motion } from "framer-motion";

export function ChaosBlock() {
  return (
    <section className="relative w-full py-24 md:py-32 px-4 flex justify-center items-center overflow-hidden">
      {/* Background with overlapping noise & generic elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-10 md:left-[10%] left-2 bg-neutral-900/80 border border-white/5 p-4 rounded-xl blur-[1px] rotate-[-5deg] text-neutral-400 text-sm md:text-base shadow-2xl">
          Looking for a team... Anyone need a backend dev?
        </div>
        <div className="absolute top-40 md:right-[15%] right-2 bg-neutral-900/80 border border-white/5 p-4 rounded-xl blur-[2px] rotate-[8deg] text-neutral-400 text-sm md:text-base shadow-2xl">
          [INAT] Hobby project searching for artists!
        </div>
        <div className="absolute top-[60%] md:left-[20%] left-4 bg-neutral-900/80 border border-white/5 p-4 rounded-xl blur-[1.5px] rotate-[-12deg] text-neutral-400 text-sm md:text-base shadow-2xl">
          Is there a Discord for finding React partners?
        </div>
        <div className="absolute bottom-[20%] md:right-[10%] right-4 bg-neutral-900/80 border border-white/5 p-4 rounded-xl blur-[1px] rotate-[15deg] text-neutral-400 text-sm md:text-base shadow-2xl">
          I have an idea but no coding skills. DM me.
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-4xl text-center bg-black/60 backdrop-blur-2xl border border-white/10 p-10 md:p-20 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Tired of searching for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">needle</span> in a haystack?
        </h2>
        <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
          So were we. Navigating dead Reddit threads and messy Discord servers is soul-crushing. You shouldn't have to fight the internet just to find people who share your vision.
        </p>
      </motion.div>
    </section>
  );
}
