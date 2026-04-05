"use client";

import { motion } from "framer-motion";
import { Code2, Database, LayoutTemplate, Server, Cpu, Cloud } from "lucide-react";

export function TechMarquee() {
  const icons = [
    { icon: <LayoutTemplate size={32} />, name: "React" },
    { icon: <Cpu size={32} />, name: "Rust" },
    { icon: <Code2 size={32} />, name: "Python" },
    { icon: <Cloud size={32} />, name: "AWS" },
    { icon: <Server size={32} />, name: "Go" },
    { icon: <Database size={32} />, name: "Terraform" },
  ];

  // duplicate for infinite scroll
  const marqueeItems = [...icons, ...icons, ...icons, ...icons, ...icons, ...icons];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-white/[0.01] py-8">
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10" />
      
      <motion.div 
        className="flex w-max space-x-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {marqueeItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-neutral-600 hover:text-white transition-colors duration-500">
            {item.icon}
            <span className="text-xl font-bold">{item.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
