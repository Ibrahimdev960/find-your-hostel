import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { Hostel, TablesInsert, TablesUpdate } from '../../../types';
import type { HostelWithRelations } from '../types';

/** Owner's hostels (newest first). */
export async function listOwnerHostels(ownerId: string): Promise<Hostel[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return unwrap(result);
}

/** Single hostel with seat types, images and facility links. */
export async function getHostel(id: string): Promise<HostelWithRelations> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .select('*, seat_types(*), hostel_images(*), hostel_facilities(facility_id)')
    .eq('id', id)
    .single();
  return unwrap(result) as unknown as HostelWithRelations;
}

export async function createHostel(input: TablesInsert<'hostels'>): Promise<Hostel> {
  const supabase = getSupabase();
  const result = await supabase.from('hostels').insert(input).select('*').single();
  return unwrap(result);
}

export async function updateHostel(id: string, patch: TablesUpdate<'hostels'>): Promise<Hostel> {
  const supabase = getSupabase();
  const result = await supabase.from('hostels').update(patch).eq('id', id).select('*').single();
  return unwrap(result);
}

export async function deleteHostel(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('hostels').delete().eq('id', id);
  if (error) throw toApiError(error);
}

/** Owner submits a draft for admin verification. */
export async function submitHostelForReview(id: string): Promise<Hostel> {
  return updateHostel(id, { status: 'pending' });
}

/** Owner publishes a verified hostel (gate enforced by DB trigger). */
export async function publishHostel(id: string): Promise<Hostel> {
  return updateHostel(id, { status: 'published' });
}

export async function unpublishHostel(id: string): Promise<Hostel> {
  return updateHostel(id, { status: 'unpublished' });
}
