import { getSupabase } from '../../../lib/supabase';
import { toApiError } from '../../../utils/apiError';
import type { SearchHostelCard } from '../types';

/**
 * Personalized "Recommended for you" listings for the signed-in student.
 * Rule-based (institution / saved-viewed-booked affinity / price band / rating +
 * featured boost) via the get_recommendations RPC; falls back to top-rated
 * published listings for new users, so it never resolves empty.
 */
export async function getRecommendations(limit = 8): Promise<SearchHostelCard[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_recommendations', { p_limit: limit });
  if (error) throw toApiError(error);
  return data ?? [];
}

/**
 * Record that the current student viewed a hostel (fire-and-forget from the detail
 * page). Anonymous visitors and non-published hostels are ignored server-side.
 */
export async function trackHostelView(hostelId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('track_hostel_view', { p_hostel_id: hostelId });
  if (error) throw toApiError(error);
}
