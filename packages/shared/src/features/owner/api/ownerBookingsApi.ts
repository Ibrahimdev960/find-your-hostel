import { getSupabase } from '../../../lib/supabase';
import { unwrap } from '../../../utils/apiError';
import type { Booking, BookingStatus } from '../../../types';
import type { BookingWithHostel } from '../../student/types';

const HOSTEL_SELECT =
  '*, hostel:hostels(id, name, city, nearest_institution, cover_image_url)';

/** Bookings across all of an owner's hostels (RLS scopes to owner_id), newest first. */
export async function listOwnerBookings(ownerId: string): Promise<BookingWithHostel[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('bookings')
    .select(HOSTEL_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return unwrap(result) as unknown as BookingWithHostel[];
}

/** Owner-side status transition (confirm / move-in / activate / complete / reject). */
export async function setBookingStatus(
  id: string,
  status: BookingStatus,
  reason?: string
): Promise<Booking> {
  const supabase = getSupabase();
  const result = await supabase
    .from('bookings')
    .update({ status, ...(reason !== undefined ? { cancel_reason: reason } : {}) })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export const confirmBooking = (id: string) => setBookingStatus(id, 'reserved');
export const markMovedIn = (id: string) => setBookingStatus(id, 'moved_in');
export const activateBooking = (id: string) => setBookingStatus(id, 'active');
export const completeBooking = (id: string) => setBookingStatus(id, 'completed');
export const rejectBooking = (id: string, reason?: string) =>
  setBookingStatus(id, 'rejected', reason);
