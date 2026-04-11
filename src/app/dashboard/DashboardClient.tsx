'use client';

import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/Nav';
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
    <div className="min-h-screen bg-background flex text-foreground">
      <DashboardNav userId={userId} profile={profile} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <div className="p-4 pb-24 md:py-8 md:pr-8 md:pl-2">
          {children}
        </div>
      </main>
    </div>
  );
}
