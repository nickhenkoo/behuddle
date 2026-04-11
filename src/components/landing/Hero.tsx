"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useRef } from "react";


export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yFloating = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section ref={ref} className="relative flex flex-col justify-center min-h-[95vh] bg-background pt-20">
      
      {/* Floating decorative elements */}
      <motion.div
        style={{ y: yFloating, willChange: "transform" }}
        animate={{ rotate: [0, 45, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] text-sage/40 z-0 pointer-events-none"
      >
        <Plus className="w-8 h-8" strokeWidth={1} />
      </motion.div>
      <motion.div
        style={{ y: yFloating, willChange: "transform" }}
        animate={{ rotate: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[25%] right-[15%] text-sage/40 hidden md:block z-0 pointer-events-none"
      >
        <span className="text-4xl font-display leading-none">✦</span>
      </motion.div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-16 overflow-visible">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-[clamp(2.25rem,6vw+1rem,4.5rem)] font-semibold text-heading max-w-2xl leading-[1.2] overflow-visible"
        >
          <span className="font-serif italic text-sage-dark font-normal">You have an idea.</span><br />
          Someone has the hands.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-[1.05rem] text-secondary max-w-md font-light leading-relaxed"
        >
          From concept to creation — find the person who turns your idea into something real. The space where lonely side-projects turn into real startups.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex items-center gap-6"
        >
          <Link href="#roles" className="btn-pill-dark inline-block !px-9 !py-3.5 !text-[15px]">
            Find a match
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-hint uppercase tracking-widest font-medium">
            <span className="w-8 h-px bg-neutral-300" />
            Est. 2026
          </div>
        </motion.div>
      </div>
    </section>
  );
}
