import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  setConversationBlock,
  toggleConversationPin,
} from '../api/messagingApi';
import { getSupabase } from '../lib/supabase';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';
import type { Message } from '../types';

export const conversationKeys = {
  all: [queryRoots.conversations] as const,
  list: [queryRoots.conversations, 'list'] as const,
  messages: (conversationId: string) => [queryRoots.messages, conversationId] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.list,
    queryFn: () => listConversations(),
    staleTime: STALE_TIME.realtime,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.messages(conversationId)
      : conversationKeys.messages('none'),
    queryFn: () => listMessages(conversationId as string),
    enabled: Boolean(conversationId),
    staleTime: STALE_TIME.realtime,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      void qc.invalidateQueries({ queryKey: conversationKeys.list });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => markConversationRead(conversationId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: conversationKeys.list }),
  });
}

export function useTogglePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      toggleConversationPin(id, pinned),
    onSuccess: () => void qc.invalidateQueries({ queryKey: conversationKeys.list }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSetBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      setConversationBlock(id, blocked),
    onSuccess: (_d, v) => {
      toast.success(v.blocked ? 'Conversation blocked' : 'Conversation unblocked');
      void qc.invalidateQueries({ queryKey: conversationKeys.list });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Start a conversation (or reuse one) and return its id via the callback. */
export function useStartConversation() {
  return useMutation({
    mutationFn: ({ otherId, hostelId }: { otherId: string; hostelId?: string | null }) =>
      getOrCreateConversation(otherId, hostelId),
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Subscribe to a thread's new messages and push them straight into the Query cache. */
export function useConversationRealtime(conversationId: string | undefined): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId) return;
    const supabase = getSupabase();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          qc.setQueryData<Message[]>(conversationKeys.messages(conversationId), (prev) => {
            if (!prev) return [msg];
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          void qc.invalidateQueries({ queryKey: conversationKeys.list });
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, qc]);
}
