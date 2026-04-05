"use client";

import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

export function MatchmakingWidget() {
  return (
    <section className="py-24 md:py-32 px-4 w-full flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-full backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center gap-6 max-w-5xl"
      >
        <div className="text-xl md:text-2xl text-neutral-300 flex flex-wrap items-center justify-center gap-3">
          <span>I am a</span>
          <div className="relative">
             <select className="bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-primary focus:outline-none focus:border-primary appearance-none cursor-pointer transition-colors">
               <option>Frontend Developer</option>
               <option>Backend Developer</option>
               <option>UI/UX Designer</option>
               <option>Data Scientist</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
          </div>
          <span>looking for an</span>
          <div className="relative">
             <select className="bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-secondary focus:outline-none focus:border-secondary appearance-none cursor-pointer transition-colors">
               <option>AI Project</option>
               <option>Web3 Startup</option>
               <option>Fintech Tool</option>
               <option>Open Source Library</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
          </div>
          <span>to work</span>
          <div className="relative">
             <select className="bg-black/50 hover:bg-black/70 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:border-white appearance-none cursor-pointer transition-colors">
               <option>5 hours/week</option>
               <option>10 hours/week</option>
               <option>Part-time</option>
               <option>Full-time</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
          </div>
        </div>
        
        <button className="mt-4 md:mt-0 flex items-center justify-center w-full md:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all shrink-0">
          <span className="md:inline mr-2">Find my match</span>
          <Search className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
}
