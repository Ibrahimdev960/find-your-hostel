import { getSupabase } from '../lib/supabase';
import { unwrap } from '../utils/apiError';
import type { OwnerProfile, OwnerVerificationStatus } from '../types';

/** An owner verification record joined to a lightweight slice of its base profile. */
export type AdminOwner = OwnerProfile & {
  profile: {
    full_name: string | null;
    phone: string | null;
    gender: string | null;
    institution: string | null;
    created_at: string;
  } | null;
};

const OWNER_SELECT =
  '*, profile:profiles(full_name, phone, gender, institution, created_at)';

/** List owner verification records, optionally filtered by status. Admin RLS required. */
export async function listOwners(status?: OwnerVerificationStatus): Promise<AdminOwner[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('owner_profiles')
    .select(OWNER_SELECT)
    .order('submitted_at', { ascending: true, nullsFirst: false });
  if (status) query = query.eq('status', status);
  return unwrap(await query) as unknown as AdminOwner[];
}

/** Set an owner's verification status (the guard trigger stamps reviewed_at/by). */
async function setOwnerStatus(
  id: string,
  status: OwnerVerificationStatus,
  rejection_reason: string | null = null
): Promise<OwnerProfile> {
  const supabase = getSupabase();
  const result = await supabase
    .from('owner_profiles')
    .update({ status, rejection_reason })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export const approveOwner = (id: string) => setOwnerStatus(id, 'approved');
export const rejectOwner = (id: string, reason: string) => setOwnerStatus(id, 'rejected', reason);
export const suspendOwner = (id: string, reason: string) => setOwnerStatus(id, 'suspended', reason);
export const reactivateOwner = (id: string) => setOwnerStatus(id, 'approved');
