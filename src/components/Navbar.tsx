"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full top-0 left-0 right-0 z-50 fixed bg-background border-b border-black/[0.06] flex items-center justify-between px-8 md:px-16 py-5"
    >
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L2 22h20L12 2z" className="text-black" />
        </svg>
        <span className="font-display text-xl font-bold tracking-tight text-black">behuddle</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
        <Link href="/" className="text-black border-b border-black pb-0.5">Home</Link>
        <a href="#two-doors" className="hover:text-black transition-colors">Who you are</a>
        <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
        <a href="#manifesto" className="hover:text-black transition-colors">Manifesto</a>
      </div>

      <div>
        <Link href="/login" className="brutal-btn-dark !py-2 !px-6 text-sm">
          Join community
        </Link>
      </div>
    </motion.nav>
  );
}
