"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import LogoPng from "@/app/logo.png";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/", isHome: true },
  { label: "Who are you", href: "#two-doors" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Manifesto", href: "#manifesto" },
];

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function handleHomeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-[1400px] w-[calc(100%-2rem)] bg-white/90 backdrop-blur-md border border-black/[0.08] rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.07)] flex items-center justify-between px-8 py-3.5"
    >
      <div className="flex items-center gap-1.5">
        <Image
          src={LogoPng}
          alt="behuddle logo"
          width={24}
          height={24}
          className="object-contain"
        />
        <span className="font-display text-xl font-bold tracking-tight text-black">behuddle</span>
      </div>

      <div
        className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            onClick={link.isHome ? handleHomeClick : undefined}
            onMouseEnter={() => setHoveredIndex(i)}
            className="relative py-0.5 text-neutral-600 hover:text-black transition-colors duration-150"
          >
            {link.label}

            {/* Animated underline */}
            {hoveredIndex === i && (
              <motion.span
                layoutId="navbar-underline"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </a>
        ))}
      </div>

      <div>
        <Link href="/login" className="btn-pill-dark !py-2 !px-7 text-sm">
          Join community
        </Link>
      </div>
    </motion.nav>
  );
}
