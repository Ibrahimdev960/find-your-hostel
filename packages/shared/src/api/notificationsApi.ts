import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Notification } from '../types';

export type { NotificationType } from '../types';

/** Recent notifications for a user, newest first. */
export async function fetchNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return unwrap(result);
}

/** Count of unread notifications (head request — no rows transferred). */
export async function fetchUnreadCount(userId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw toApiError(error);
  return count ?? 0;
}

export async function markRead(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw toApiError(error);
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw toApiError(error);
}

/** Register (or re-activate) a push token for the current user. */
export async function registerPushToken(input: {
  userId: string;
  token: string;
  platform?: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: input.userId, token: input.token, platform: input.platform ?? 'web', is_active: true },
      { onConflict: 'token' }
    );
  if (error) throw toApiError(error);
}

export async function deactivatePushToken(token: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('token', token);
  if (error) throw toApiError(error);
}
