'use client';

import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/Nav';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { useMatchNotifications } from '@/lib/hooks/useMatchNotifications';

interface NavProfile {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

export function DashboardClient({
  userId,
  children,
  profile,
}: {
  userId: string | null;
  children: ReactNode;
  profile?: NavProfile;
}) {
  useMatchNotifications(userId);

  return (
    <div className="h-screen w-screen bg-[#f6f5f4] flex text-[#1A1918] overflow-hidden">
      {/* Left Navigation Dock */}
      <DashboardNav userId={userId} profile={profile} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Header — always pinned, outside scroll container */}
        <div className="shrink-0 px-4 md:px-6 pt-3 pb-2">
          <TopHeader userId={userId} profile={profile} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
