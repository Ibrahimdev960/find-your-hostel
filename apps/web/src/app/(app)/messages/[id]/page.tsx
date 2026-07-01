'use client';

import { use, useEffect, useRef, useState } from 'react';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/dialog';
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
  const [confirmBlock, setConfirmBlock] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversation = conversations.data?.find((c) => c.id === id);

  useEffect(() => {
    if (id) markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, messages.data?.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.data?.length]);

  const blocked = conversation?.is_blocked ?? false;
  const iBlocked = blocked && conversation?.blocked_by === myId;

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    send.mutate(body, { onSuccess: () => setText('') });
  };

  return (
    <div className="space-y-4 pb-8">
      <PageHeader
        title={conversation?.other_name ?? 'Conversation'}
        subtitle={conversation?.hostel_name ?? undefined}
        useBackNavigation
        backFallbackHref="/messages"
      >
        <div className="flex justify-end">
          <Button
            variant="destructiveGhost"
            size="sm"
            onClick={() =>
              blocked ? setBlock.mutate({ id, blocked: false }) : setConfirmBlock(true)
            }
            disabled={setBlock.isPending || (blocked && !iBlocked)}
          >
            {blocked ? (iBlocked ? 'Unblock' : 'Blocked') : 'Block'}
          </Button>
        </div>
      </PageHeader>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title="Block this person?"
        description="They won't be able to message you. You can unblock them again any time."
        confirmLabel="Block"
        cancelLabel="Cancel"
        loading={setBlock.isPending}
        onConfirm={() =>
          setBlock.mutate({ id, blocked: true }, { onSuccess: () => setConfirmBlock(false) })
        }
      />

      {isLoading || !user ? (
        <div className="h-[58dvh] animate-pulse sm:h-[60vh] rounded-[24px] bg-background-secondary" />
      ) : (
        <>
          <div className="h-[58dvh] space-y-2 overflow-y-auto sm:h-[60vh] rounded-[24px] border border-border bg-card p-4">
            {messages.isLoading ? (
              <p className="text-center text-sm text-foreground-muted">Loading…</p>
            ) : messages.data?.length === 0 ? (
              <p className="pt-10 text-center text-sm text-foreground-muted">
                No messages yet. Say hello 👋
              </p>
            ) : (
              messages.data?.map((m) => {
                const mine = m.sender_id === myId;
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%]',
                        mine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background-secondary text-foreground'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={cn(
                          'mt-0.5 text-[10px]',
                          mine ? 'text-primary-foreground/70' : 'text-foreground-muted'
                        )}
                      >
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
            <p className="rounded-2xl border border-border bg-card py-3 text-center text-sm text-foreground-muted">
              This conversation is blocked. {iBlocked ? 'Unblock to resume messaging.' : ''}
            </p>
          ) : (
            <form
              onSubmit={onSend}
              className="sticky bottom-0 -mx-4 flex items-center gap-2 border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
            >
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
        </>
      )}
    </div>
  );
}
