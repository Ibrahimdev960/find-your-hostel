import { getSupabase } from '../lib/supabase';
import { unwrap } from '../utils/apiError';
import type { Hostel } from '../types';

/** Hostels awaiting admin verification (status = 'pending'). Admin RLS required. */
export async function listPendingHostels(): Promise<Hostel[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
  return unwrap(result);
}

/** Approve a listing → 'verified' (trigger stamps reviewed_at/by). */
export async function verifyHostel(id: string): Promise<Hostel> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .update({ status: 'verified' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export async function rejectHostel(id: string, reason: string): Promise<Hostel> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

/** Admin force-unpublish a live listing. */
export async function adminUnpublishHostel(id: string): Promise<Hostel> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .update({ status: 'unpublished' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}
