'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/clients';
import { toast } from 'sonner';

// userId is passed from DashboardClient (already fetched on the server),
// so we avoid a redundant auth.getUser() call on every mount.
export function useMatchNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let isMounted = true;
    const instanceId = Math.random().toString(36).slice(2, 7);

    const channel = supabase
      .channel(`match-notifications-${userId}-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `profile_b=eq.${userId},status_b=eq.pending`,
        },
        async (payload) => {
          if (!isMounted) return;

          const match = payload.new as { profile_a: string; project_id: string };

          const [{ data: profileA }, { data: project }] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', match.profile_a).single(),
            supabase.from('projects').select('title').eq('id', match.project_id).single(),
          ]);

          if (profileA && project) {
            toast.success(`New match: ${profileA.full_name}`, {
              description: `on ${project.title}`,
              action: {
                label: 'View',
                onClick: () => { window.location.href = '/dashboard/matches'; },
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
