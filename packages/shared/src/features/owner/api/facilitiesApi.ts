import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { Facility } from '../../../types';

/** The shared amenity catalog (read-only for owners). */
export async function listFacilities(): Promise<Facility[]> {
  const supabase = getSupabase();
  const result = await supabase.from('facilities').select('*').order('label', { ascending: true });
  return unwrap(result);
}

/** Replace a hostel's facility links with the given set. */
export async function setHostelFacilities(hostelId: string, facilityIds: string[]): Promise<void> {
  const supabase = getSupabase();

  const del = await supabase.from('hostel_facilities').delete().eq('hostel_id', hostelId);
  if (del.error) throw toApiError(del.error);

  if (facilityIds.length === 0) return;

  const ins = await supabase
    .from('hostel_facilities')
    .insert(facilityIds.map((facility_id) => ({ hostel_id: hostelId, facility_id })));
  if (ins.error) throw toApiError(ins.error);
}
