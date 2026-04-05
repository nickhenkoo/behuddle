"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Bell, Search } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "My Projects", active: false },
  { icon: MessageSquare, label: "Messages", active: false, badge: true },
];

export default function DashboardPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background flex text-neutral-900">

      {/* Sidebar */}
      <aside className="w-64 border-r border-black/10 bg-white flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-black/10">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-black hover:opacity-75 transition-opacity">
            Team<span className="text-primary">Up</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ icon: Icon, label, active, badge }) => (
            <button
              key={label}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 ${
                active
                  ? "bg-black text-white"
                  : "text-neutral-500 hover:text-black hover:bg-black/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {badge && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" aria-label="Unread messages" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/10 space-y-1">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-500 hover:text-black hover:bg-black/5 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-16 border-b border-black/10 flex items-center justify-between px-4 md:px-8 bg-white shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search builders and ideas"
              placeholder="Search builders, ideas..."
              className="w-full bg-neutral-100 border border-transparent rounded-xl pl-10 pr-4 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black/20 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button
              aria-label="Notifications"
              className="text-neutral-500 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md p-0.5"
            >
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0" aria-label="User profile">
              <span className="font-display text-white text-xs font-bold">Y</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 tracking-tight text-black">
                Welcome to the Garage
              </h1>
              <p className="text-neutral-500">Your activity at a glance.</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Messages — featured: the only actionable metric */}
              <div className="flex items-center justify-between p-6 rounded-2xl border border-black/10 bg-white">
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Messages</div>
                  <div className="font-display text-5xl font-bold tabular-nums text-primary">4</div>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
                >
                  View inbox →
                </button>
              </div>

              {/* Secondary metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-black/10 bg-white">
                  <div className="text-sm text-neutral-500 mb-1">Active Applications</div>
                  <div className="font-display text-3xl font-bold tabular-nums text-black">12</div>
                </div>
                <div className="p-5 rounded-2xl border border-black/10 bg-white">
                  <div className="text-sm text-neutral-500 mb-1">Profile Views</div>
                  <div className="font-display text-3xl font-bold tabular-nums text-black">349</div>
                </div>
              </div>
            </div>

            {/* Empty state */}
            <div className="p-8 rounded-2xl border border-black/10 bg-white flex flex-col items-center justify-center text-center min-h-[280px]">
              <motion.div
                animate={prefersReducedMotion ? {} : { scale: [1, 1.07, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 border border-black/10"
              >
                <LayoutDashboard className="w-8 h-8 text-neutral-400" aria-hidden="true" />
              </motion.div>
              <h3 className="font-display text-xl font-bold mb-2 tracking-tight text-black">
                Nothing here yet
              </h3>
              <p className="text-neutral-500 max-w-sm mb-6 text-sm">
                Share your idea or skills, then browse people looking for someone like you. It starts with a message.
              </p>
              <Link href="/" className="brutal-btn text-sm">
                Browse People
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
