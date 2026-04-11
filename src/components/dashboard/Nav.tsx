"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Shuffle, Users, Lightbulb,
  Globe, MessageSquare, Hash, Settings,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavProfile {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface DashboardNavProps {
  userId: string | null;
  profile?: NavProfile;
}

interface NavGroup {
  label?: string;
  items: { href: string; icon: React.ElementType; label: string }[];
}

const GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/dashboard",         icon: LayoutDashboard, label: "Home" },
      { href: "/dashboard/matches", icon: Shuffle,         label: "Matches" },
    ],
  },
  {
    label: "Discover",
    items: [
      { href: "/dashboard/people", icon: Users,     label: "People" },
      { href: "/dashboard/ideas",  icon: Lightbulb, label: "Ideas" },
      { href: "/dashboard/map",    icon: Globe,      label: "Globe" },
    ],
  },
  {
    label: "Connect",
    items: [
      { href: "/dashboard/community", icon: Hash,          label: "Community" },
      { href: "/dashboard/messages",  icon: MessageSquare, label: "Messages" },
    ],
  },
];

function NavItem({ href, icon: Icon, label, active, badge, isCollapsed }: {
  href: string; icon: React.ElementType; label: string; active: boolean; badge?: number; isCollapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center px-3 py-[8px] rounded-xl text-[13px] font-medium transition-all duration-200 ${
        isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-2.5"
      } ${
        active
          ? "text-white bg-white/10"
          : "text-sage-light/60 hover:text-white hover:bg-white/5"
      }`}
      title={isCollapsed ? label : undefined}
    >
      {active && (
        <motion.span 
          layoutId="activeNavIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-sage-light" 
        />
      )}
      <Icon className={`w-[16px] h-[16px] shrink-0 transition-colors ${active ? "text-white" : "text-sage-light/60 group-hover:text-white"}`} />
      
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}

      {badge && badge > 0 && (
        <span className={`rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-semibold ${
          isCollapsed 
            ? "absolute -top-1 -right-1 w-3 h-3 text-[8px]" 
            : "ml-auto w-4 h-4"
        }`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function Avatar({ name, url, size = 7 }: { name?: string | null; url?: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className={`w-${size} h-${size} rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-white text-[11px] font-semibold overflow-hidden`}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={name ?? ""} className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );
}

export function DashboardNav({ userId, profile }: DashboardNavProps) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadMessages(userId);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 88 : 220 }}
        className="hidden md:flex flex-col shrink-0 m-4 rounded-[24px] bg-[#1a1e19] text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 overflow-hidden z-20 h-[calc(100vh-32px)]"
      >
        {/* Toggle Button */}
        <div className={`p-4 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} border-b border-white/5`}>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-display font-bold text-[16px] tracking-wide px-2"
            >
              behuddle
            </motion.span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-sage-light/50 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && !isCollapsed && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 mb-2 text-[10px] font-semibold text-sage-light/40 uppercase tracking-[0.1em]"
                >
                  {group.label}
                </motion.p>
              )}
              {group.label && isCollapsed && (
                <div className="w-8 h-px bg-white/10 mx-auto mb-3 mt-1" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={isActive(item.href)}
                    badge={item.label === "Messages" ? unreadCount : undefined}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1 bg-white/[0.02]">
          <NavItem
            href="/dashboard/settings"
            icon={Settings}
            label="Settings"
            active={isActive("/dashboard/settings")}
            isCollapsed={isCollapsed}
          />

          {profile && (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} pt-3 mt-3 border-t border-white/5`}>
              <Avatar name={profile.full_name} url={profile.avatar_url} size={isCollapsed ? 8 : 7} />
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="min-w-0"
                >
                  <p className="text-[13px] font-medium text-white/90 truncate leading-tight">
                    {profile.full_name ?? "You"}
                  </p>
                  <p className="text-[11px] text-sage-light/50 capitalize leading-tight mt-0.5">
                    {profile.role ?? "member"}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#1a1e19]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] grid grid-cols-5 px-2 py-2">
        {[...GROUPS[0].items, ...GROUPS[1].items, GROUPS[2].items[1]].map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all ${
                active ? "text-white bg-white/10" : "text-sage-light/50 hover:text-white"
              }`}
            >
              {active && (
                <motion.span 
                  layoutId="activeMobileIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-[3px] rounded-b-full bg-sage-light" 
                />
              )}
              <Icon className={`w-[18px] h-[18px] ${active ? "stroke-[2.2px]" : "stroke-[1.8px]"}`} />
              <span className="text-[9.5px] font-medium tracking-wide">{label}</span>
              {label === "Messages" && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-semibold">
                  {unreadCount > 99 ? '99' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
