'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useMessages,
  useSendMessage,
  useConversationRealtime,
  useMarkConversationRead,
  useConversations,
  useSetBlock,
} from '@findyourhostel/shared/hooks';
import { formatDate } from '@findyourhostel/shared';
import { useAuthStore } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export default function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading } = useRequireAuth();
  const myId = useAuthStore((s) => s.user?.id);

  const messages = useMessages(id);
  const send = useSendMessage(id);
  const markRead = useMarkConversationRead();
  const setBlock = useSetBlock();
  const conversations = useConversations();
  useConversationRealtime(id);

  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversation = conversations.data?.find((c) => c.id === id);

  // Mark read when the thread (or its message list) changes.
  useEffect(() => {
    if (id) markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, messages.data?.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data?.length]);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const blocked = conversation?.is_blocked ?? false;
  const iBlocked = blocked && conversation?.blocked_by === myId;

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    send.mutate(body, { onSuccess: () => setText('') });
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-2rem)] max-w-2xl flex-col px-6 py-4">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <Link href="/messages" className="text-sm text-brand-600 hover:underline">
          ← Messages
        </Link>
        <div className="text-center">
          <p className="font-semibold text-neutral-900">{conversation?.other_name ?? 'Conversation'}</p>
          {conversation?.hostel_name && (
            <p className="text-xs text-neutral-400">{conversation.hostel_name}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setBlock.mutate({ id, blocked: !blocked })}
          disabled={setBlock.isPending || (blocked && !iBlocked)}
        >
          {blocked ? (iBlocked ? 'Unblock' : 'Blocked') : 'Block'}
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages.isLoading ? (
          <p className="text-center text-sm text-neutral-500">Loading…</p>
        ) : messages.data?.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">No messages yet. Say hello 👋</p>
        ) : (
          messages.data?.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                    mine ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-900'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn('mt-0.5 text-[10px]', mine ? 'text-white/70' : 'text-neutral-400')}>
                    {formatDate(m.created_at, 'dd MMM, HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {blocked ? (
        <p className="border-t border-neutral-200 py-3 text-center text-sm text-neutral-500">
          This conversation is blocked. {iBlocked ? 'Unblock to resume messaging.' : ''}
        </p>
      ) : (
        <form onSubmit={onSend} className="flex items-center gap-2 border-t border-neutral-200 pt-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            autoComplete="off"
          />
          <Button type="submit" disabled={send.isPending || !text.trim()}>
            Send
          </Button>
        </form>
      )}
    </main>
  );
}
