"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadMessages } from "@/lib/hooks/useUnreadMessages";
import { roleLabel } from "@/lib/utils/roles";

interface NavProfile {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface TopHeaderProps {
  userId: string | null;
  profile?: NavProfile;
}

function Avatar({ name, url, size = 8 }: { name?: string | null; url?: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className={`w-${size} h-${size} rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-600 text-[11px] font-semibold overflow-hidden border border-black/5`}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={name ?? ""} className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );
}

export function TopHeader({ userId, profile }: TopHeaderProps) {
  const { unreadCount } = useUnreadMessages(userId);
  const pathname = usePathname();

  const getPageName = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const path = pathname.split("/").filter(Boolean);
    if (path.length > 1) {
      return path[1].charAt(0).toUpperCase() + path[1].slice(1);
    }
    return "Dashboard";
  };

  return (
    <header className="w-full flex items-center justify-between px-6 md:px-8 h-16 bg-white/70 backdrop-blur-xl border border-black/[0.04] shadow-[0_8px_32px_rgba(26,25,24,0.06)] rounded-full transition-all">

      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-[18px] tracking-tight text-[#1A1918]">
          behuddle
        </span>
        <div className="w-px h-4 bg-black/10 hidden sm:block" />
        <span className="text-[14px] font-medium text-neutral-500 hidden sm:block">
          {getPageName()}
        </span>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Search — desktop */}
        <div className="relative hidden md:block">
          <img
            src="/icons/iconsax-search-81aa50cc524a-.svg"
            alt=""
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] brightness-0 opacity-30 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search behuddle..."
            className="w-56 xl:w-80 h-10 pl-10 pr-4 rounded-full bg-white border border-black/[0.06] text-[13.5px] text-[#1A1918] placeholder-neutral-400 outline-none transition-all shadow-[0_2px_12px_rgba(26,25,24,0.02)]"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Mobile search */}
          <button className="relative p-2 rounded-full text-neutral-500 hover:text-[#1A1918] hover:bg-black/5 transition-colors md:hidden">
            <img src="/icons/iconsax-search-81aa50cc524a-.svg" alt="Search" className="w-[18px] h-[18px] brightness-0 opacity-50" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full text-neutral-500 hover:bg-black/5 transition-colors">
            <img src="/icons/iconsax-notification-b41356e5e328-.svg" alt="Notifications" className="w-[18px] h-[18px] brightness-0 opacity-50" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
          </button>

          {/* Settings */}
          <Link href="/dashboard/settings" className="p-2 rounded-full text-neutral-500 hover:bg-black/5 transition-colors">
            <img src="/icons/iconsax-setting-2-f167a9bbceb2-.svg" alt="Settings" className="w-[18px] h-[18px] brightness-0 opacity-50" />
          </Link>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 md:pl-5 border-l border-black/[0.06]">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13.5px] font-semibold text-[#1A1918] leading-tight whitespace-nowrap">
              {profile?.full_name ?? "You"}
            </span>
            <span className="text-[11px] font-medium text-neutral-500 leading-tight mt-0.5 whitespace-nowrap">
              {roleLabel(profile?.role)}
            </span>
          </div>
          <Avatar name={profile?.full_name} url={profile?.avatar_url} size={10} />
        </div>

      </div>
    </header>
  );
}
