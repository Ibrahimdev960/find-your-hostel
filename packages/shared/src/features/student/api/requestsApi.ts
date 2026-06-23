import { getSupabase } from '../../../lib/supabase';
import { unwrap } from '../../../utils/apiError';
import type { HostelRequest, Offer } from '../../../types';
import type { RequestWithOfferCount, OfferWithHostel } from '../types';
import type { CreateRequestInput } from '../schemas';

/** Create a hostel request for the current student (status forced 'open' by the trigger). */
export async function createRequest(
  studentId: string,
  input: CreateRequestInput
): Promise<HostelRequest> {
  const supabase = getSupabase();
  const result = await supabase
    .from('requests')
    .insert({
      student_id: studentId,
      hostel_type: input.hostel_type ?? null,
      seat_type: input.seat_type ?? null,
      city: input.city || null,
      nearest_institution: input.nearest_institution || null,
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      move_in_date: input.move_in_date || null,
      duration_months: input.duration_months,
      notes: input.notes || null,
    })
    .select('*')
    .single();
  return unwrap(result);
}

/** The student's requests with a live offer count, newest first. */
export async function listStudentRequests(studentId: string): Promise<RequestWithOfferCount[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('requests')
    .select('*, offers(count)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return unwrap(result) as unknown as RequestWithOfferCount[];
}

export async function getRequest(id: string): Promise<HostelRequest> {
  const supabase = getSupabase();
  const result = await supabase.from('requests').select('*').eq('id', id).single();
  return unwrap(result);
}

/** Offers on a request (the student reviews these); includes the offered hostel. */
export async function listRequestOffers(requestId: string): Promise<OfferWithHostel[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .select('*, hostel:hostels(id, name, city, nearest_institution)')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  return unwrap(result) as unknown as OfferWithHostel[];
}

export async function cancelRequest(id: string): Promise<HostelRequest> {
  const supabase = getSupabase();
  const result = await supabase
    .from('requests')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

/** "Start a New Request" — clone a request's details into a fresh open request. */
export async function cloneRequest(studentId: string, sourceId: string): Promise<HostelRequest> {
  const src = await getRequest(sourceId);
  return createRequest(studentId, {
    hostel_type: src.hostel_type ?? undefined,
    seat_type: src.seat_type ?? undefined,
    city: src.city ?? undefined,
    nearest_institution: src.nearest_institution ?? undefined,
    budget_min: src.budget_min ?? undefined,
    budget_max: src.budget_max ?? undefined,
    move_in_date: src.move_in_date ?? undefined,
    duration_months: src.duration_months,
    notes: src.notes ?? undefined,
  });
}

/** Student accepts an offer → trigger books the request + auto-rejects the rest. */
export async function acceptOffer(id: string): Promise<Offer> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export async function rejectOffer(id: string): Promise<Offer> {
  const supabase = getSupabase();
  const result = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}
