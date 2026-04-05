"use client";

import { motion } from "framer-motion";

export function ThePulse() {
  return (
    <section className="py-24 md:py-32 px-4 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16 relative">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Pulse</h2>
        <p className="text-lg md:text-xl text-neutral-400">Live projects looking for teammates right now.</p>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/10 blur-[80px] -z-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[280px]">
        {/* Card 1: The Hot Startup */}
        <motion.div 
          className="md:col-span-2 relative p-6 md:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden group hover:border-white/20 transition-all"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white tracking-wide">
              STARTUP
            </span>
            <span className="text-xs text-secondary font-bold tracking-wider relative flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              HOT
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">AI-driven Finance</h3>
          <p className="text-neutral-400 mb-6 max-w-sm">Revolutionizing personal finance with autonomous agents that actually understand context.</p>
          <div className="flex gap-2 mb-8">
            {["Next.js", "Python", "AWS"].map(tag => (
               <span key={tag} className="text-xs text-neutral-500 bg-white/5 px-2 py-1 rounded-md">{tag}</span>
            ))}
          </div>
          <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8">
            <div className="flex justify-between text-xs text-neutral-400 mb-2">
              <span>Team Completion</span>
              <span>3/5 members found</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full w-[60%] bg-gradient-to-r from-primary to-secondary rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Open Source */}
        <motion.div 
          className="relative p-6 md:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden group hover:border-white/20 transition-all flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="mb-auto">
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold tracking-wide mb-6 inline-block">
              OPEN SOURCE
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Rust-based CLI</h3>
            <p className="text-sm text-neutral-400">Looking for: Backend Lead</p>
          </div>
          <div className="mt-8">
            {/* Github style activity graph dummy */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
               {Array.from({length: 21}).map((_, i) => (
                 <div key={i} className={`h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-green-500/40' : Math.random() > 0.8 ? 'bg-green-500' : 'bg-white/5'}`} />
               ))}
            </div>
            <span className="text-xs text-neutral-500">High activity</span>
          </div>
        </motion.div>

        {/* Card 3: Quick Collab */}
        <motion.div 
          className="md:col-span-3 relative p-6 md:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden group hover:border-white/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold tracking-wide mb-4 inline-block">
              QUICK COLLAB
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Need a UI designer for 4 hours.</h3>
            <p className="text-sm text-neutral-400">Finishing up a hackathon project, need some magic touches.</p>
          </div>
          <button className="mt-4 md:mt-0 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold transition-colors border border-white/10">
            I can help
          </button>
        </motion.div>
      </div>
    </section>
  );
}
