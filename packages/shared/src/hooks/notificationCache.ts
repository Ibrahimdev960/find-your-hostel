import type { QueryClient } from '@tanstack/react-query';
import { queryRoots } from '../lib/queryKeys';
import type { Notification } from '../types';

export const notificationKeys = {
  all: [queryRoots.notifications] as const,
  list: (userId: string) => [queryRoots.notifications, 'list', userId] as const,
  unread: (userId: string) => [queryRoots.notifications, 'unread', userId] as const,
};

/** Prepend a freshly-arrived notification into the cached list (de-duplicated). */
export function upsertNotificationInCache(
  qc: QueryClient,
  userId: string,
  n: Notification
): void {
  qc.setQueryData<Notification[]>(notificationKeys.list(userId), (prev) => {
    if (!prev) return [n];
    if (prev.some((x) => x.id === n.id)) return prev;
    return [n, ...prev];
  });
}

/** Flip a single notification to read in the cached list. */
export function markReadInCache(qc: QueryClient, userId: string, id: string): void {
  qc.setQueryData<Notification[]>(notificationKeys.list(userId), (prev) =>
    prev?.map((x) => (x.id === id ? { ...x, is_read: true } : x))
  );
}
