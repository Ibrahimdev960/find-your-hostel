import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Promotion } from '../types';

export const createPromotionSchema = z.object({
  hostel_id: z.string().uuid({ message: 'Pick a hostel' }),
  plan: z.enum(['featured_1d', 'featured_3d', 'featured_7d', 'featured_30d']),
  payment_method: z.enum(['bank_transfer', 'jazzcash', 'easypaisa', 'cash']),
  proof_url: z.string().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

/** Owner submits a featured-listing purchase (status forced 'pending' by the trigger). */
export async function createPromotion(
  ownerId: string,
  input: CreatePromotionInput
): Promise<Promotion> {
  const supabase = getSupabase();
  const result = await supabase
    .from('promotions')
    .insert({
      owner_id: ownerId,
      hostel_id: input.hostel_id,
      plan: input.plan,
      payment_method: input.payment_method,
      proof_url: input.proof_url || null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

export async function listOwnerPromotions(ownerId: string): Promise<Promotion[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('promotions')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return unwrap(result);
}

/** Admin: promotions awaiting review, newest first. */
export async function listPendingPromotions(): Promise<Promotion[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('promotions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return unwrap(result);
}

export async function approvePromotion(id: string): Promise<Promotion> {
  const supabase = getSupabase();
  const result = await supabase
    .from('promotions')
    .update({ status: 'active' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export async function rejectPromotion(id: string, reason?: string): Promise<Promotion> {
  const supabase = getSupabase();
  const result = await supabase
    .from('promotions')
    .update({ status: 'rejected', rejection_reason: reason ?? null })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

/** Public: record an impression/click against a hostel's active promotion. */
export async function trackPromotionEvent(
  hostelId: string,
  event: 'impression' | 'click'
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('track_promotion_event', {
    p_hostel_id: hostelId,
    p_event: event,
  });
  if (error) throw toApiError(error);
}
