import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { ConversationSummary, Message } from '../types';

/** Find or create the conversation between the caller and another user (optionally a hostel). */
export async function getOrCreateConversation(
  otherId: string,
  hostelId?: string | null
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_other_id: otherId,
    p_hostel_id: hostelId ?? null,
  });
  if (error) throw toApiError(error);
  return data as string;
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('list_conversations');
  if (error) throw toApiError(error);
  return data ?? [];
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return unwrap(result);
}

/** Send a message (sender stamped server-side; blocked conversations are rejected). */
export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const supabase = getSupabase();
  const result = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, body })
    .select('*')
    .single();
  return unwrap(result);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId });
  if (error) throw toApiError(error);
}

export async function toggleConversationPin(conversationId: string, pinned: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('toggle_conversation_pin', {
    p_conversation_id: conversationId,
    p_pinned: pinned,
  });
  if (error) throw toApiError(error);
}

export async function setConversationBlock(conversationId: string, blocked: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('set_conversation_block', {
    p_conversation_id: conversationId,
    p_blocked: blocked,
  });
  if (error) throw toApiError(error);
}
