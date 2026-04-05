"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Lightbulb, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function HumanityToggle() {
  const [hovered, setHovered] = useState<"idea" | "skill" | null>(null);

  return (
    <section className="py-24 md:py-32 px-4 max-w-6xl mx-auto w-full">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Who are you today?</h2>
        <p className="text-lg md:text-xl text-neutral-400">Select your state and let us do the rest.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 relative">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent md:w-[1px] md:h-full md:bg-gradient-to-b md:from-transparent md:via-white/10 md:to-transparent z-0"
        />

        <motion.div
          onMouseEnter={() => setHovered("idea")}
          onMouseLeave={() => setHovered(null)}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn(
            "relative p-10 md:p-14 rounded-3xl border border-white/10 transition-all duration-500 cursor-pointer overflow-hidden z-10",
            hovered === "idea" ? "bg-white/5 border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.2)]" : "bg-black/50"
          )}
        >
          {hovered === "idea" && (
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          )}
          <Lightbulb className={cn("w-12 h-12 mb-6 transition-colors duration-500", hovered === "idea" ? "text-primary" : "text-neutral-500")} />
          <h3 className="text-3xl font-bold mb-4">I am an Idea.</h3>
          <p className={cn("text-lg transition-colors duration-500", hovered === "idea" ? "text-neutral-200" : "text-neutral-500")}>
            Looking for those who can breathe life into my vision. I have the roadmap, I need the hands.
          </p>
        </motion.div>

        <motion.div
           onMouseEnter={() => setHovered("skill")}
           onMouseLeave={() => setHovered(null)}
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className={cn(
            "relative p-10 md:p-14 rounded-3xl border border-white/10 transition-all duration-500 cursor-pointer overflow-hidden z-10",
            hovered === "skill" ? "bg-white/5 border-secondary/50 shadow-[0_0_40px_rgba(34,211,238,0.2)]" : "bg-black/50"
          )}
        >
          {hovered === "skill" && (
             <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none" />
          )}
          <Wrench className={cn("w-12 h-12 mb-6 transition-colors duration-500", hovered === "skill" ? "text-secondary" : "text-neutral-500")} />
          <h3 className="text-3xl font-bold mb-4">I am a Stack.</h3>
          <p className={cn("text-lg transition-colors duration-500", hovered === "skill" ? "text-neutral-200" : "text-neutral-500")}>
            Looking to apply my skills to something real. I have the hands, I need the mission.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
