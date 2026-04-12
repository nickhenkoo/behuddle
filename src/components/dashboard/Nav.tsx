"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import { motion } from "framer-motion";

interface NavProfile {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface DashboardNavProps {
  userId: string | null;
  profile?: NavProfile;
}

// Icon mapping: all SVGs from /public/icons/ (white strokes/fill)
const ICON_MAP: Record<string, string> = {
  home:      "/icons/iconsax-home-2-646ab96177ba-.svg",
  matches:   "/icons/iconsax-repeat-arrow-609f448bc58a-.svg",
  people:    "/icons/iconsax-profile-2user-b3a4b2213bc4-.svg",
  ideas:     "/icons/iconsax-lamp-on-8030cecfd6fb-.svg",
  globe:     "/icons/iconsax-global-b704efed5310-.svg",
  messages:  "/icons/iconsax-message-text-9bcf13062cd7-.svg",
  community: "/icons/iconsax-hashtag-3fa85500ab97-.svg",
  settings:  "/icons/iconsax-setting-2-f167a9bbceb2-.svg",
};

interface NavGroup {
  label?: string;
  items: { href: string; iconKey: string; label: string }[];
}

const GROUPS: NavGroup[] = [
  {
    items: [
      { href: "/dashboard",         iconKey: "home",      label: "Home" },
      { href: "/dashboard/matches", iconKey: "matches",   label: "Matches" },
    ],
  },
  {
    label: "Discover",
    items: [
      { href: "/dashboard/people", iconKey: "people",    label: "People" },
      { href: "/dashboard/ideas",  iconKey: "ideas",     label: "Ideas" },
      { href: "/dashboard/map",    iconKey: "globe",     label: "Globe" },
    ],
  },
  {
    label: "Connect",
    items: [
      { href: "/dashboard/community", iconKey: "community", label: "Community" },
      { href: "/dashboard/messages",  iconKey: "messages",  label: "Messages" },
    ],
  },
];

function NavItem({ href, iconKey, label, active, badge }: {
  href: string; iconKey: string; label: string; active: boolean; badge?: number;
}) {
  const src = ICON_MAP[iconKey];
  return (
    <Link
      href={href}
      className={`group relative flex items-center justify-center w-11 h-11 rounded-[16px] transition-all duration-300 ${
        active
          ? "bg-[#1A1918] text-white shadow-[0_4px_12px_rgba(26,25,24,0.15)]"
          : "hover:bg-black/[0.04]"
      }`}
      title={label}
    >
      {/* Icon: white SVG, inverted to dark when inactive */}
      <img
        src={src}
        alt={label}
        className={`w-[20px] h-[20px] shrink-0 transition-all duration-200 ${
          active
            ? "brightness-100"
            : "brightness-0 opacity-40 group-hover:opacity-65"
        }`}
      />

      {(badge ?? 0) > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-[2px] border-[#f6f5f4] flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
          {(badge ?? 0) > 99 ? '99' : badge}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute left-[calc(100%+16px)] px-3 py-1.5 rounded-lg bg-[#1A1918] text-white text-[12px] font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
        {label}
        <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#1A1918]" />
      </span>
    </Link>
  );
}

export function DashboardNav({ userId, profile }: DashboardNavProps) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadMessages(userId);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Floating Dock (desktop) ── */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="hidden md:flex flex-col items-center justify-center py-6 px-3 m-4 md:my-auto shrink-0 rounded-[28px] bg-white border border-black/[0.04] shadow-[0_8px_32px_rgba(26,25,24,0.06)] z-20 h-auto gap-8"
      >
        <div className="flex flex-col items-center gap-6 w-full">
          {GROUPS.map((group, gi) => (
            <div key={gi} className="flex flex-col items-center gap-2 relative w-full">
              {gi > 0 && (
                <div className="absolute -top-4 w-6 h-px bg-black/[0.06]" />
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  iconKey={item.iconKey}
                  label={item.label}
                  active={isActive(item.href)}
                  badge={item.label === "Messages" ? unreadCount : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </motion.aside>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#1A1918]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] grid grid-cols-5 px-2 py-2">
        {[...GROUPS[0].items, ...GROUPS[1].items, GROUPS[2].items[1]].map(({ href, iconKey, label }) => {
          const active = isActive(href);
          const src = ICON_MAP[iconKey];
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all ${
                active ? "text-white bg-white/10" : "text-white/50 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="activeMobileIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-[3px] rounded-b-full bg-sage-light"
                />
              )}
              {/* Dark mobile nav — white icons are correct as-is */}
              <img
                src={src}
                alt={label}
                className={`w-[18px] h-[18px] transition-opacity ${active ? "opacity-100" : "opacity-45"}`}
              />
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
