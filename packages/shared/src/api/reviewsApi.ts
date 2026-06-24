import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Review } from '../types';

const rating = z.coerce.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  booking_id: z.string().uuid(),
  rating_overall: rating,
  rating_cleanliness: rating.optional(),
  rating_facilities: rating.optional(),
  rating_location: rating.optional(),
  rating_value: rating.optional(),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/** Student creates a review for a booking (hostel/name snapshotted server-side). */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reviews')
    .insert({
      booking_id: input.booking_id,
      rating_overall: input.rating_overall,
      rating_cleanliness: input.rating_cleanliness ?? null,
      rating_facilities: input.rating_facilities ?? null,
      rating_location: input.rating_location ?? null,
      rating_value: input.rating_value ?? null,
      comment: input.comment || null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

/** Owner responds to a review on their hostel. */
export async function respondToReview(reviewId: string, response: string): Promise<Review> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reviews')
    .update({ owner_response: response })
    .eq('id', reviewId)
    .select('*')
    .single();
  return unwrap(result);
}

export async function listHostelReviews(hostelId: string): Promise<Review[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reviews')
    .select('*')
    .eq('hostel_id', hostelId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });
  return unwrap(result);
}

/** Admin: most recent reviews across all hostels (includes hidden, for moderation). */
export async function listAllReviews(limit = 100): Promise<Review[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return unwrap(result);
}

/** Admin: soft-hide or restore a review (hiding removes it from the rating aggregate). */
export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<Review> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reviews')
    .update({ is_hidden: hidden })
    .eq('id', reviewId)
    .select('*')
    .single();
  return unwrap(result);
}

/** The current student's review for a booking, or null if not yet reviewed. */
export async function getReviewForBooking(bookingId: string): Promise<Review | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (error) throw toApiError(error);
  return data;
}
