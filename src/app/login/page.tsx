"use client";

import { motion } from "framer-motion";
import { useTransition, useState } from "react";
import Link from "next/link";
import { ArrowRight, Chrome } from "lucide-react";
import { login, loginWithGoogle } from "@/lib/supabase/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  };

  const handleGoogle = () => {
    startTransition(async () => {
      const result = await loginWithGoogle();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 text-sm text-neutral-500 hover:text-black transition-colors"
      >
        ← Back home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
      >
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-black mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-500">
            Enter your details to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            aria-label="Email address"
            placeholder="Email address"
            autoComplete="email"
            autoFocus
            className="w-full bg-white border border-black/20 rounded-2xl px-4 py-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
            required
          />
          <input
            type="password"
            name="password"
            aria-label="Password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full bg-white border border-black/20 rounded-2xl px-4 py-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
            required
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="brutal-btn-dark w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in…" : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-black/10 flex-1" />
          <span className="text-xs text-neutral-400 font-medium">OR</span>
          <div className="h-px bg-black/10 flex-1" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={isPending}
          className="w-full bg-white text-black font-medium border-2 border-black rounded-2xl px-4 py-3 mt-4 flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors shadow-[3px_3px_0_0_rgba(0,0,0,1)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-black font-medium hover:underline transition-all"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
