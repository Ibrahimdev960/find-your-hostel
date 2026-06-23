import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { Booking } from '../../../types';
import type { BookingWithHostel, SeatAvailability } from '../types';
import type { CreateBookingInput } from '../schemas';

const HOSTEL_SELECT =
  '*, hostel:hostels(id, name, city, nearest_institution, cover_image_url)';

/**
 * Create a booking for the current student. Pricing, owner_id, occupancy and the
 * initial status are all snapshotted server-side by the guard_booking trigger, so the
 * client only supplies the seat + booking details.
 */
export async function createBooking(
  studentId: string,
  input: CreateBookingInput
): Promise<Booking> {
  const supabase = getSupabase();
  const result = await supabase
    .from('bookings')
    .insert({
      student_id: studentId,
      seat_type_id: input.seat_type_id,
      move_in_date: input.move_in_date,
      duration_months: input.duration_months,
      payment_method: input.payment_method,
      special_requests: input.special_requests || null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

/** Student cancels their own booking (trigger enforces it's still cancellable). */
export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  const supabase = getSupabase();
  const result = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancel_reason: reason ?? null })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

/** Bookings made by a student (RLS scopes to the caller), newest first. */
export async function listStudentBookings(studentId: string): Promise<BookingWithHostel[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('bookings')
    .select(HOSTEL_SELECT)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return unwrap(result) as unknown as BookingWithHostel[];
}

export async function getBooking(id: string): Promise<BookingWithHostel> {
  const supabase = getSupabase();
  const result = await supabase.from('bookings').select(HOSTEL_SELECT).eq('id', id).single();
  return unwrap(result) as unknown as BookingWithHostel;
}

/** Live seat counts for a hostel (used by the confirm-booking screen). */
export async function getSeatAvailability(hostelId: string): Promise<SeatAvailability[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('seat_availability', { p_hostel_id: hostelId });
  if (error) throw toApiError(error);
  return data ?? [];
}
