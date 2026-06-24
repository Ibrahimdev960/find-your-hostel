import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Profile, UserRole } from '../types';

/** A platform user record (admin view). */
export type AdminUser = Profile;

export type AdminUsersFilter = {
  role?: UserRole;
  search?: string;
};

/** List users for the admin Users page. Admin RLS gives read access to all profiles. */
export async function listUsers(filter: AdminUsersFilter = {}): Promise<AdminUser[]> {
  const supabase = getSupabase();
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

  if (filter.role) query = query.eq('role', filter.role);
  if (filter.search) {
    const term = `%${filter.search}%`;
    query = query.or(`full_name.ilike.${term},phone.ilike.${term},institution.ilike.${term}`);
  }

  return unwrap(await query.limit(200));
}

/** Suspend or reactivate a user account (audited server-side via log_activity). */
export async function setUserSuspended(
  userId: string,
  suspended: boolean,
  reason: string | null = null
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('admin_set_user_suspended', {
    p_user_id: userId,
    p_suspended: suspended,
    p_reason: reason,
  });
  if (error) throw toApiError(error);
}
