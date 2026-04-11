'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/clients';
import { toast } from 'sonner';

// userId is passed from DashboardNav (received from DashboardClient → layout server),
// so we avoid a redundant auth.getUser() call on every mount.
export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .neq('sender_id', userId)
          .is('message_read_at', null);

        if (isMounted) {
          setUnreadCount(count ?? 0);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // New messages
    const messageChannel = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`,
        },
        async (payload) => {
          if (!isMounted) return;
          setUnreadCount(prev => prev + 1);

          const newMessage = payload.new as { sender_id: string };
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single();

          if (sender) {
            toast(`Message from ${sender.full_name}`, { description: 'Click to view' });
          }
        }
      )
      .subscribe();

    // Read-status updates
    const readChannel = supabase
      .channel(`read-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as { message_read_at: string | null };
          const old = payload.old as { message_read_at: string | null };
          if (isMounted && updated.message_read_at && !old.message_read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(readChannel);
    };
  }, [userId]);

  return { unreadCount, isLoading };
}
