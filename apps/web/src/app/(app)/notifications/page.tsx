'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bell, BellRing } from 'lucide-react';
import { notificationHref, formatDate } from '@findyourhostel/shared';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@findyourhostel/shared/hooks';
import type { Notification } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { enableWebPush } from '@/lib/webPush';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const notifications = useNotifications(user?.id);
  const markRead = useMarkNotificationRead(user?.id ?? '');
  const markAll = useMarkAllNotificationsRead(user?.id ?? '');
  const [enabling, setEnabling] = useState(false);

  const open = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    router.push(notificationHref(n));
  };

  const onEnablePush = async () => {
    setEnabling(true);
    const ok = await enableWebPush(user!.id);
    setEnabling(false);
    if (ok) toast.success("Alerts on — we'll let you know when something needs you.");
    else toast.error('We couldn’t turn on alerts. Check your browser permissions.');
  };

  const hasUnread = notifications.data?.some((n) => !n.is_read) ?? false;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Notifications"
        subtitle="Everything that needs your attention, in one place."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEnablePush} disabled={enabling}>
            <BellRing className="h-4 w-4" />
            {enabling ? 'Turning on…' : 'Turn on alerts'}
          </Button>
          <Button
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || !hasUnread}
          >
            Mark all read
          </Button>
        </div>
      </PageHeader>

      {isLoading || !user || notifications.isLoading ? (
        <SkeletonList count={5} />
      ) : notifications.data?.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New activity on your bookings, offers, and messages will show up here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.data?.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => open(n)}
              className={cn(
                'block w-full rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                n.is_read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  {n.title}
                </span>
                <span className="shrink-0 text-xs text-foreground-muted">
                  {formatDate(n.created_at, 'dd MMM, HH:mm')}
                </span>
              </div>
              {n.body && <p className="mt-0.5 text-sm text-foreground-muted">{n.body}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
