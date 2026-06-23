import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { SeatType } from '../../../types';
import type { SeatTypeInput } from '../schemas';

export async function listSeatTypes(hostelId: string): Promise<SeatType[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('seat_types')
    .select('*')
    .eq('hostel_id', hostelId)
    .order('monthly_rent', { ascending: true });
  return unwrap(result);
}

/**
 * Replace the full set of seat types for a hostel (delete-then-insert).
 * Simpler and race-free for the wizard than diffing individual rows.
 */
export async function replaceSeatTypes(
  hostelId: string,
  rows: SeatTypeInput[]
): Promise<SeatType[]> {
  const supabase = getSupabase();

  const del = await supabase.from('seat_types').delete().eq('hostel_id', hostelId);
  if (del.error) throw toApiError(del.error);

  if (rows.length === 0) return [];

  const result = await supabase
    .from('seat_types')
    .insert(rows.map((r) => ({ ...r, hostel_id: hostelId })))
    .select('*');
  return unwrap(result);
}
