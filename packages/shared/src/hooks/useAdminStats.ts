import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from '../api/adminStatsApi';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import type { AdminUsersFilter } from '../api/adminUsersApi';
import type { BookingStatus, OwnerVerificationStatus } from '../types';

/** Admin-panel query keys (dashboard stats, owners / users / bookings queues). */
export const adminKeys = {
  stats: () => [queryRoots.admin, 'stats'] as const,
  owners: (status?: OwnerVerificationStatus) => [queryRoots.admin, 'owners', status ?? 'all'] as const,
  users: (filter: AdminUsersFilter) => [queryRoots.admin, 'users', filter] as const,
  bookings: (status?: BookingStatus) => [queryRoots.admin, 'bookings', status ?? 'all'] as const,
  reviews: () => [queryRoots.admin, 'reviews'] as const,
  posts: (topic?: string) => [queryRoots.admin, 'posts', topic ?? 'all'] as const,
};

/** Admin dashboard KPIs. */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => getAdminDashboardStats(),
    staleTime: STALE_TIME.short,
  });
}
