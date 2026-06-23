import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllRead,
  markRead,
} from '../api/notificationsApi';
import { notificationKeys, markReadInCache } from './notificationCache';
import { STALE_TIME } from '../config/timing';

/** Recent notifications. staleTime 0 — notifications are realtime-backed. */
export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? notificationKeys.list(userId) : notificationKeys.list('anon'),
    queryFn: () => fetchNotifications(userId as string),
    enabled: Boolean(userId),
    staleTime: STALE_TIME.realtime,
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? notificationKeys.unread(userId) : notificationKeys.unread('anon'),
    queryFn: () => fetchUnreadCount(userId as string),
    enabled: Boolean(userId),
    staleTime: STALE_TIME.realtime,
  });
}

export function useMarkNotificationRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: (_d, id) => {
      markReadInCache(qc, userId, id);
      void qc.invalidateQueries({ queryKey: notificationKeys.unread(userId) });
    },
  });
}

export function useMarkAllNotificationsRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.list(userId) });
      void qc.invalidateQueries({ queryKey: notificationKeys.unread(userId) });
    },
  });
}
