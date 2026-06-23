import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { SearchFilters } from '../schemas';
import type { PublicHostel, SearchHostelCard } from '../types';

/** Run the search_hostels RPC with the given filters. */
export async function searchHostels(filters: SearchFilters): Promise<SearchHostelCard[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('search_hostels', {
    p_q: filters.q || null,
    p_city: filters.city || null,
    p_hostel_type: filters.hostel_type ?? null,
    p_seat_type: filters.seat_type ?? null,
    p_min_price: filters.min_price ?? null,
    p_max_price: filters.max_price ?? null,
    p_facility_ids: filters.facility_ids?.length ? filters.facility_ids : null,
    p_lat: filters.lat ?? null,
    p_lng: filters.lng ?? null,
    p_sort: filters.sort,
  });
  if (error) throw toApiError(error);
  return data ?? [];
}

/** Public hostel detail (only resolves for published listings, enforced by RLS). */
export async function getHostelPublic(id: string): Promise<PublicHostel> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostels')
    .select('*, seat_types(*), hostel_images(*), hostel_facilities(facilities(*))')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  const row = unwrap(result) as unknown as PublicHostel & {
    hostel_facilities: { facilities: PublicHostel['facilities'][number] }[];
  };

  // Flatten the join (hostel_facilities → facilities) into a plain facility list.
  const facilities = (row.hostel_facilities ?? [])
    .map((hf) => hf.facilities)
    .filter(Boolean);

  return { ...row, facilities };
}
