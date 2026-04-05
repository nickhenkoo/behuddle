"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
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
            {isLogin ? "Welcome back" : "Join the crew"}
          </h1>
          <p className="text-sm text-neutral-500">
            {isLogin
              ? "Enter your details to access your dashboard."
              : "Create an account to start building."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              type="text"
              aria-label="Username"
              placeholder="Username"
              autoComplete="username"
              className="w-full bg-white border border-black/20 rounded-xl px-4 py-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
              required
            />
          )}
          <input
            type="email"
            aria-label="Email address"
            placeholder="Email address"
            autoComplete="email"
            autoFocus={isLogin}
            className="w-full bg-white border border-black/20 rounded-xl px-4 py-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
            required
          />
          <input
            type="password"
            aria-label="Password"
            placeholder="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="w-full bg-white border border-black/20 rounded-xl px-4 py-3 text-black placeholder-neutral-400 focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
            required
          />

          <button
            type="submit"
            className="brutal-btn-dark w-full flex items-center justify-center gap-2 mt-2"
          >
            {isLogin ? "Sign In" : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-black/10 flex-1" />
          <span className="text-xs text-neutral-400 font-medium">OR</span>
          <div className="h-px bg-black/10 flex-1" />
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-[#24292e] text-white font-medium border-2 border-black rounded-xl px-4 py-3 mt-4 flex items-center justify-center gap-2 hover:bg-[#2b3137] transition-colors shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        <div className="mt-8 text-center text-sm text-neutral-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-black font-medium hover:underline transition-all"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
