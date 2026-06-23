'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { notificationHref, formatDate } from '@findyourhostel/shared';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@findyourhostel/shared/hooks';
import type { Notification } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { enableWebPush } from '@/lib/webPush';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const notifications = useNotifications(user?.id);
  const markRead = useMarkNotificationRead(user?.id ?? '');
  const markAll = useMarkAllNotificationsRead(user?.id ?? '');
  const [enabling, setEnabling] = useState(false);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const open = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    router.push(notificationHref(n));
  };

  const onEnablePush = async () => {
    setEnabling(true);
    const ok = await enableWebPush(user.id);
    setEnabling(false);
    if (ok) toast.success('Push notifications enabled');
    else toast.error('Push permission denied');
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEnablePush} disabled={enabling}>
            {enabling ? 'Enabling…' : 'Enable push'}
          </Button>
          <Button
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || !notifications.data?.some((n) => !n.is_read)}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {notifications.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : notifications.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            You’re all caught up.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.data?.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => open(n)}
              className={cn(
                'block w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-neutral-50',
                n.is_read ? 'border-neutral-200 bg-white' : 'border-brand-200 bg-brand-50/40'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-neutral-900">{n.title}</span>
                <span className="text-xs text-neutral-400">{formatDate(n.created_at, 'dd MMM, HH:mm')}</span>
              </div>
              {n.body && <p className="mt-0.5 text-sm text-neutral-600">{n.body}</p>}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
