import { getSupabase } from '../../../lib/supabase';
import { toApiError } from '../../../utils/apiError';
import type { OwnerProfile } from '../../../types';
import type { OwnerVerificationInput } from '../schemas';

/** Fetch the current owner's verification profile, or null if not started yet. */
export async function getOwnerProfile(ownerId: string): Promise<OwnerProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('owner_profiles')
    .select('*')
    .eq('id', ownerId)
    .maybeSingle();
  if (error) throw toApiError(error);
  return data;
}

/**
 * Submit (or resubmit) owner verification documents. Upserts the owner_profiles row;
 * status is forced to 'pending' server-side by the guard trigger. submitted_at stamped here.
 */
export async function submitOwnerVerification(
  ownerId: string,
  input: OwnerVerificationInput
): Promise<OwnerProfile> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('owner_profiles')
    .upsert(
      {
        id: ownerId,
        ...input,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();
  if (error) throw toApiError(error);
  return data;
}
