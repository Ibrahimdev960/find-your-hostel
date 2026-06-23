import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Report, ReportStatus, Block } from '../types';

export const createReportSchema = z.object({
  target_type: z.enum(['hostel', 'review', 'message', 'profile', 'request']),
  target_id: z.string().uuid(),
  reason: z.string().min(5, 'Tell us what’s wrong').max(500),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

/** File a report/flag (reporter + pending status stamped server-side). */
export async function createReport(input: CreateReportInput): Promise<Report> {
  const supabase = getSupabase();
  const result = await supabase.from('reports').insert(input).select('*').single();
  return unwrap(result);
}

/** Admin: list reports, optionally filtered by status. */
export async function listReports(status?: ReportStatus): Promise<Report[]> {
  const supabase = getSupabase();
  let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  return unwrap(await query);
}

/** Admin: resolve/dismiss a report (reviewer stamped server-side). */
export async function resolveReport(
  id: string,
  status: ReportStatus,
  note?: string
): Promise<Report> {
  const supabase = getSupabase();
  const result = await supabase
    .from('reports')
    .update({ status, resolution_note: note ?? null })
    .eq('id', id)
    .select('*')
    .single();
  return unwrap(result);
}

export async function blockUser(blockerId: string, blockedId: string): Promise<Block> {
  const supabase = getSupabase();
  const result = await supabase
    .from('blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId })
    .select('*')
    .single();
  return unwrap(result);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw toApiError(error);
}
