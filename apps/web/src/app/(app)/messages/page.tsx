'use client';

import Link from 'next/link';
import { MessageSquare, Pin } from 'lucide-react';
import { formatDate } from '@findyourhostel/shared';
import { useConversations, useTogglePin } from '@findyourhostel/shared/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export default function MessagesPage() {
  const { user, isLoading } = useRequireAuth();
  const conversations = useConversations();
  const togglePin = useTogglePin();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Messages" subtitle="Your conversations with hostels and students." />

      {isLoading || !user || conversations.isLoading ? (
        <SkeletonList count={5} />
      ) : conversations.data?.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a chat from any hostel page to message the owner."
        />
      ) : (
        <div className="space-y-2">
          {conversations.data?.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3',
                c.unread_count > 0 ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              )}
            >
              <button
                type="button"
                aria-label={c.pinned ? 'Unpin' : 'Pin'}
                onClick={() => togglePin.mutate({ id: c.id, pinned: !c.pinned })}
                className={cn(
                  'shrink-0 transition',
                  c.pinned ? 'text-primary' : 'text-foreground-muted hover:text-foreground-secondary'
                )}
              >
                <Pin className="h-4 w-4" fill={c.pinned ? 'currentColor' : 'none'} />
              </button>
              <Link href={`/messages/${c.id}`} className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-foreground">
                    {c.other_name ?? 'User'}
                    {c.hostel_name && <span className="text-foreground-muted"> · {c.hostel_name}</span>}
                  </span>
                  {c.last_message_at && (
                    <span className="shrink-0 text-xs text-foreground-muted">
                      {formatDate(c.last_message_at, 'dd MMM')}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-foreground-muted">
                  {c.is_blocked ? 'Blocked' : (c.last_message ?? 'No messages yet')}
                </p>
              </Link>
              {c.unread_count > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {c.unread_count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
