"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import Link from "next/link";
import { loginWithOtp, loginWithGoogle } from "@/lib/supabase/actions";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.5 12.28c0-.85-.08-1.66-.22-2.45H12v4.62h6.46c-.28 1.5-1.12 2.76-2.4 3.61v3h3.87c2.26-2.09 3.57-5.17 3.57-8.78z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A11.99 11.99 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.27 14.28A7.2 7.2 0 0 1 4.93 12c0-.79.13-1.55.35-2.28V6.62H1.28A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.28 5.38l3.99-3.1z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.18 15.23 0 12 0 7.42 0 3.19 2.7 1.28 6.62l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      fill="#EA4335"
    />
  </svg>
);


export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPendingEmail, startEmailTransition] = useTransition();
  const [isPendingGoogle, startGoogleTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim();
    if (!email) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    const formData = new FormData(form);
    startEmailTransition(async () => {
      const result = await loginWithOtp(formData);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  };

  const handleGoogle = () => {
    startGoogleTransition(async () => {
      const result = await loginWithGoogle();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="h-screen overflow-hidden bg-background flex flex-col md:flex-row items-stretch font-sans">

      {/* Left side: branding/quote */}
      <div className="relative flex-1 bg-[#1a1e19] text-white p-8 md:p-16 flex flex-col justify-between hidden md:flex">
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-sage-light/20 blur-[100px] rounded-full pointer-events-none" />
        <Link
          href="/"
          className="relative z-10 text-[13px] text-sage-light/60 hover:text-sage-light transition-colors flex items-center gap-2 group"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
          <span className="font-display font-bold uppercase tracking-wide">Home</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-md"
        >
          <h2 className="font-display text-[clamp(2.5rem,4vw,4rem)] font-semibold text-[#f5f5f5] leading-[1.25] mb-8 overflow-visible">
            Build something<br />
            <span className="font-serif italic text-sage-light/90 font-normal">together.</span>
          </h2>
          <p className="text-[1.1rem] text-sage-light/60 font-light leading-relaxed">
            The hardest part of a startup isn&apos;t the idea or the code.<br />It&apos;s finding the right person to build it with.
          </p>
        </motion.div>
        <div className="absolute top-16 right-16 text-sage/10 text-6xl pointer-events-none">✦</div>
      </div>

      {/* Right side: form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <Link
          href="/"
          className="md:hidden absolute top-8 left-8 text-[13px] text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 group"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-0.5">←</span>
          <span className="font-display font-bold uppercase tracking-wide">Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px]"
        >
          <div className="mb-10 text-center">
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-heading mb-2">
              Welcome back
            </h1>
            <p className="text-[14px] text-secondary font-light">
              Enter your email to get a magic link.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                <div className="text-[2rem]">✉️</div>
                <p className="text-[15px] font-medium text-heading">Check your inbox</p>
                <p className="text-[13px] text-secondary">We sent a magic link to your email. Click it to sign in.</p>
              </motion.div>
            ) : (
              <motion.div key="form">
                <button
                  onClick={handleGoogle}
                  disabled={isPendingGoogle || isPendingEmail}
                  className="w-full flex items-center justify-center gap-3 bg-white text-foreground hover:text-heading text-[14px] font-medium border border-neutral-200 hover:border-neutral-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-full px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                >
                  {isPendingGoogle ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Redirecting…
                    </span>
                  ) : (
                    <><GoogleIcon /> Continue with Google</>
                  )}
                </button>

                <div className="flex items-center gap-4 my-8">
                  <div className="h-px bg-neutral-200 flex-1" />
                  <span className="text-[10px] text-hint tracking-widest uppercase font-medium">or</span>
                  <div className="h-px bg-neutral-200 flex-1" />
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[13px] font-medium text-foreground">What&apos;s your email address?</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Enter your email address..."
                      required
                      className="w-full bg-white hover:bg-white/80 border border-transparent focus:bg-white focus:border-sage-light focus:ring-4 focus:ring-sage-light/20 rounded-full px-4 py-3 text-[14px] text-foreground placeholder-hint outline-none transition-all duration-200"
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12.5px] text-[#8B6F5E] flex items-center justify-center gap-1.5"
                    >
                      <span className="inline-block w-1 h-1 rounded-full bg-[#8B6F5E] shrink-0" />
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={isPendingEmail || isPendingGoogle}
                    className="w-full bg-primary hover:bg-[#2a2928] text-primary-foreground text-[14px] font-medium rounded-full px-4 py-3.5 mt-2 shadow-[0_8px_32px_-4px_rgba(26,25,24,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(26,25,24,0.16)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-light focus-visible:ring-offset-1 active:scale-[0.98]"
                  >
                    {isPendingEmail ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Sending link…
                      </span>
                    ) : (
                      "Continue with email"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[11.5px] text-hint leading-relaxed">
                  By continuing, you acknowledge Behuddle&apos;s{" "}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-secondary transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-[13px] text-secondary font-light">
            New to behuddle?{" "}
            <Link
              href="/signup"
              className="text-foreground font-medium hover:text-heading transition-colors underline decoration-neutral-300 underline-offset-4 hover:decoration-heading"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
