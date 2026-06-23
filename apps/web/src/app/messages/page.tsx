'use client';

import Link from 'next/link';
import { Pin } from 'lucide-react';
import { formatDate } from '@findyourhostel/shared';
import { useConversations, useTogglePin } from '@findyourhostel/shared/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export default function MessagesPage() {
  const { user, isLoading } = useRequireAuth();
  const conversations = useConversations();
  const togglePin = useTogglePin();

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>

      {conversations.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : conversations.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No conversations yet. Start one from a hostel page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.data?.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3',
                c.unread_count > 0 ? 'border-brand-200 bg-brand-50/40' : 'border-neutral-200 bg-white'
              )}
            >
              <button
                type="button"
                aria-label={c.pinned ? 'Unpin' : 'Pin'}
                onClick={() => togglePin.mutate({ id: c.id, pinned: !c.pinned })}
                className={cn('flex-shrink-0', c.pinned ? 'text-brand-600' : 'text-neutral-300 hover:text-neutral-500')}
              >
                <Pin className="h-4 w-4" fill={c.pinned ? 'currentColor' : 'none'} />
              </button>
              <Link href={`/messages/${c.id}`} className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-neutral-900">
                    {c.other_name ?? 'User'}
                    {c.hostel_name && <span className="text-neutral-400"> · {c.hostel_name}</span>}
                  </span>
                  {c.last_message_at && (
                    <span className="flex-shrink-0 text-xs text-neutral-400">
                      {formatDate(c.last_message_at, 'dd MMM')}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {c.is_blocked ? 'Blocked' : c.last_message ?? 'No messages yet'}
                </p>
              </Link>
              {c.unread_count > 0 && (
                <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">
                  {c.unread_count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
