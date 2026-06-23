import { getSupabase } from '../../../lib/supabase';
import { unwrap } from '../../../utils/apiError';
import type { Profile, TablesUpdate } from '../../../types';

/** Fetch the current user's profile row (RLS restricts to self / admin). */
export async function getProfile(userId: string): Promise<Profile> {
  const supabase = getSupabase();
  const result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return unwrap(result);
}

/** Update editable profile fields. */
export async function updateProfile(
  userId: string,
  patch: TablesUpdate<'profiles'>
): Promise<Profile> {
  const supabase = getSupabase();
  const result = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();
  return unwrap(result);
}
