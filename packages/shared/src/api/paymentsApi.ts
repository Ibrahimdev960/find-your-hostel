import { getSupabase } from '../lib/supabase';
import { unwrap } from '../utils/apiError';
import type { Payment, PaymentStage } from '../types';
import type { PaymentMethod } from '../config/constants';

export type SubmitPaymentInput = {
  booking_id: string;
  stage: PaymentStage;
  method: PaymentMethod;
  /** Storage path in payment-proofs/<booking_id>/… (omit for cash). */
  proof_url?: string | null;
};

/** Student submits a payment. Amount + payer are snapshotted server-side by the trigger. */
export async function submitPayment(input: SubmitPaymentInput): Promise<Payment> {
  const supabase = getSupabase();
  const result = await supabase
    .from('payments')
    .insert({
      booking_id: input.booking_id,
      stage: input.stage,
      method: input.method,
      proof_url: input.proof_url ?? null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

/** Payments on a booking (RLS scopes to the student + the hostel owner), oldest first. */
export async function listBookingPayments(bookingId: string): Promise<Payment[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });
  return unwrap(result);
}

/** Owner confirms a submitted payment → advances the booking lifecycle (trigger). */
export async function confirmPayment(id: string): Promise<Payment> {
  const supabase = getSupabase();
  const result = await supabase
    .from('payments')
    .update({ status: 'confirmed' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export async function rejectPayment(id: string, reason?: string): Promise<Payment> {
  const supabase = getSupabase();
  const result = await supabase
    .from('payments')
    .update({ status: 'rejected', rejection_reason: reason ?? null })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}
