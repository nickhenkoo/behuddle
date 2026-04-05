"use client";

import { motion } from "framer-motion";
import { Caveat } from "next/font/google";

const scriptFont = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

export function FoundersCorner() {
  return (
    <section className="py-32 px-4 max-w-4xl mx-auto w-full relative z-10 flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative bg-[#fef08a] w-full max-w-2xl p-8 md:p-14 shadow-[10px_10px_30px_rgba(0,0,0,0.5)] rounded-sm border border-[#eab308]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
        }}
      >
        {/* Semitransparent tape at the top center */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/40 backdrop-blur-md rotate-[-3deg] shadow-sm transform origin-center" />

        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="flex-shrink-0 relative mt-2 md:-ml-20 md:-mt-8 shadow-[0_15px_35px_rgba(0,0,0,0.4)] rounded-full rotate-[-4deg]">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#f8f9fa] overflow-hidden relative z-10 bg-neutral-800">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Founder" className="w-full h-full object-cover sepia-[.3]" />
            </div>
          </div>

          <div className="flex-1 mt-4 md:mt-0">
            <p className={`${scriptFont.className} text-3xl md:text-4xl text-amber-950 leading-[1.6] md:leading-[1.6]`}>
              "I got tired of seeing brilliant ideas die in 'Project' folders because the author had no one to talk to. So I built this place. Welcome home, you're among friends."
            </p>
            <p className={`${scriptFont.className} text-2xl md:text-3xl text-amber-800 mt-6 text-right font-bold`}>
              – The Founder
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
