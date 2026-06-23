import { getSupabase } from '../../../lib/supabase';
import { unwrap } from '../../../utils/apiError';
import type { Offer, HostelRequest } from '../../../types';
import type { SubmitOfferInput } from '../schemas';

/**
 * Open requests an owner can respond to. Embeds the owner's OWN offer (if any) — offers
 * RLS hides other owners' offers, so this cleanly reflects "have I already offered here?".
 */
export type OpenRequest = HostelRequest & {
  offers: Pick<Offer, 'id' | 'status' | 'owner_id'>[];
};

export async function listOpenRequests(): Promise<OpenRequest[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('requests')
    .select('*, offers(id, status, owner_id)')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return unwrap(result) as unknown as OpenRequest[];
}

/** An owner's submitted offers (RLS scopes to owner_id), newest first. */
export async function listOwnerOffers(ownerId: string): Promise<Offer[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return unwrap(result);
}

/** Submit one offer on a request (DB enforces approved owner, own hostel, open request). */
export async function submitOffer(ownerId: string, input: SubmitOfferInput): Promise<Offer> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .insert({
      request_id: input.request_id,
      owner_id: ownerId,
      hostel_id: input.hostel_id,
      seat_type_id: input.seat_type_id ?? null,
      monthly_rent: input.monthly_rent,
      message: input.message || null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

export async function withdrawOffer(id: string): Promise<Offer> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .update({ status: 'withdrawn' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}
