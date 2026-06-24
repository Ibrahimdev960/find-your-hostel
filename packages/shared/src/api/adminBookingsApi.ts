import { getSupabase } from '../lib/supabase';
import { toApiError } from '../utils/apiError';
import type { BookingStatus } from '../types';
import type { Database } from '../types/database.types';

/** One row from the admin bookings monitor (flattened hostel + party names). */
export type AdminBooking =
  Database['public']['Functions']['admin_list_bookings']['Returns'][number];

/** Platform-wide bookings feed for the admin monitor (read-only, optional status filter). */
export async function listAdminBookings(status?: BookingStatus): Promise<AdminBooking[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_list_bookings', {
    p_status: status ?? null,
    p_limit: 200,
  });
  if (error) throw toApiError(error);
  return data ?? [];
}
