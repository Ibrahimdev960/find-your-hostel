'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuthStore, notificationHref, formatDate } from '@findyourhostel/shared';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
} from '@findyourhostel/shared/hooks';
import type { Notification } from '@findyourhostel/shared';
import { cn } from '@/lib/cn';

export function NotificationBell() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount(user?.id);
  const list = useNotifications(open ? user?.id : undefined);
  const markRead = useMarkNotificationRead(user?.id ?? '');

  if (!user) return null;

  const count = unread.data ?? 0;

  const onClickItem = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    setOpen(false);
    router.push(notificationHref(n));
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-secondary"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-[0_18px_44px_-20px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {list.isLoading ? (
                <p className="px-3 py-6 text-center text-sm text-foreground-muted">Loading…</p>
              ) : list.data?.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-foreground-muted">No notifications yet.</p>
              ) : (
                list.data?.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onClickItem(n)}
                    className={cn(
                      'block w-full border-b border-border px-3 py-2 text-left hover:bg-background-secondary',
                      !n.is_read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{n.title}</span>
                      {!n.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                    </div>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-foreground-muted">{n.body}</p>}
                    <p className="mt-0.5 text-[10px] text-foreground-muted">{formatDate(n.created_at, 'dd MMM, HH:mm')}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
