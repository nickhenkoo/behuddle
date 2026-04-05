"use client";

import { motion } from "framer-motion";

const stories = [
  {
    quote: "I just wanted to practice Go, and now we’re building a startup with 100+ active users.",
    author: "Alex",
    role: "Backend Lead"
  },
  {
    quote: "Found my co-founder in 3 days. We just launched our beta last week.",
    author: "Sarah",
    role: "AI Engineer"
  },
  {
    quote: "Finally a place where passion matters more than a 10-page CV.",
    author: "David",
    role: "UI/UX Designer"
  },
  {
    quote: "Built an open-source tool and got 4 amazing contributors overnight.",
    author: "Elena",
    role: "Creator"
  }
];

export function WallOfHope() {
  return (
    <section className="py-24 md:py-32 px-4 w-full overflow-hidden bg-black/40 border-y border-white/5 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Wall of Hope</h2>
          <p className="text-lg md:text-xl text-neutral-400">Real people. Real projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group"
            >
              <div className="absolute top-4 right-4 bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/30">
                Verified Match
              </div>
              <p className="text-neutral-300 font-medium italic mb-6 mt-4">"{story.quote}"</p>
              <div>
                <span className="block text-white font-bold">{story.author}</span>
                <span className="block text-neutral-500 text-sm">{story.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
