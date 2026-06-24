import { getSupabase } from '../lib/supabase';
import { toApiError } from '../utils/apiError';
import type { Database } from '../types/database.types';

/** One-row KPI snapshot for the admin dashboard. */
export type AdminDashboardStats =
  Database['public']['Functions']['admin_dashboard_stats']['Returns'][number];

/** Fetch dashboard KPIs (admin-only — the RPC raises if the caller isn't an admin). */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) throw toApiError(error);
  return data?.[0] ?? null;
}
