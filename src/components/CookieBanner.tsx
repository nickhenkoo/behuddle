"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const CONSENT_KEY = 'bh_cookie_consent';
const ACCEPT_TTL  = 365 * 24 * 60 * 60 * 1000; // 1 year
const DECLINE_TTL =  90 * 24 * 60 * 60 * 1000; // 90 days

type ConsentStatus = 'accepted' | 'declined';

function saveConsent(status: ConsentStatus, ttl: number) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ status, expires: Date.now() + ttl }));
  } catch {
    // localStorage unavailable (private browsing, etc.) — fail silently
  }
}

function hasValidConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw) as { status: ConsentStatus; expires: number };
    return Date.now() < expires;
  } catch {
    return false;
  }
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasValidConsent()) return; // already decided, don't show
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    saveConsent('accepted', ACCEPT_TTL);
    setIsVisible(false);
  };

  const handleDecline = () => {
    saveConsent('declined', DECLINE_TTL);
    setIsVisible(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="fixed bottom-0 left-0 right-0 bg-[#1A1918] text-[#f6f5f4] z-[9999]"
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[13px]">
              <motion.span
                className="text-[16px]"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🍪
              </motion.span>
              <span className="opacity-80">
                We use cookies to improve your experience.{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  Cookie Policy
                </Link>
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDecline}
                className="text-[13px] font-medium px-5 py-2.5 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 hover:bg-white/10 transition-all duration-200 active:scale-95"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="bg-white text-[#1A1918] text-[13px] font-medium rounded-full px-5 py-2.5 hover:bg-white/90 hover:shadow-[0_2px_8px_rgba(255,255,255,0.15)] transition-all duration-200 active:scale-95"
              >
                Accept all
              </button>
              <motion.button
                onClick={handleDecline}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full opacity-40 hover:opacity-100 hover:bg-white/10 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
