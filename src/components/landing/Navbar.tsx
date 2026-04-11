"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/", isHome: true },
  { label: "Find a match", href: "#roles" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Manifesto", href: "#manifesto" },
];

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          const prev = lastScrollY.current;
          if (current < 60) {
            setVisible(true);
          } else if (current > prev + 4) {
            setVisible(false);
          } else if (current < prev - 4) {
            setVisible(true);
          }
          lastScrollY.current = current;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleHomeClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: visible ? 0 : -110 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-[1200px] w-[calc(100%-4rem)] rounded-b-[24px] flex items-center px-8 h-[68px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border-b border-[#1A1918]/8"
      style={{ backgroundColor: 'rgba(246,245,244,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      {/* Left fillet (inverted curve) */}
      <div 
        className="absolute top-0 -left-[24px] w-[24px] h-[24px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 100%, transparent 24px, rgba(246,245,244,0.8) 24px)' }}
      />
      {/* Right fillet (inverted curve) */}
      <div 
        className="absolute top-0 -right-[24px] w-[24px] h-[24px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 100%, transparent 24px, rgba(246,245,244,0.8) 24px)' }}
      />

      {/* Left: Logo + Brand */}
      <div className="flex-none flex items-center gap-2.5">
        <img 
          src="/logo.svg" 
          alt="behuddle" 
          className="h-8 w-auto object-contain" 
        />
        <span className="font-display font-bold text-[20px] tracking-tight text-heading leading-none">
          behuddle
        </span>
      </div>

      {/* Center: Links (absolute) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-[14px] font-medium text-secondary"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            onClick={link.isHome ? handleHomeClick : undefined}
            onMouseEnter={() => setHoveredIndex(i)}
            className="relative py-1 text-secondary hover:text-heading transition-colors duration-150"
          >
            {link.label}
            {hoveredIndex === i && (
              <motion.span
                layoutId="navbar-underline"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-heading rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </a>
        ))}
      </div>

      {/* Right: CTA */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link href="/login" className="btn-pill-outline text-[14px]">
          Join community
        </Link>
      </div>
    </motion.nav>
  );
}
