import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '../lib/supabase';
import { notificationKeys, upsertNotificationInCache } from './notificationCache';
import type { Notification } from '../types';

/**
 * Subscribe to the user's notification inserts via Supabase Realtime and push new rows
 * straight into the Query cache (the bell + list update live). Mount once near the app root.
 */
export function useGlobalNotificationsRealtime(userId: string | undefined): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          upsertNotificationInCache(qc, userId, payload.new as Notification);
          void qc.invalidateQueries({ queryKey: notificationKeys.unread(userId) });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}
