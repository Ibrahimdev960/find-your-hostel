import { useQuery } from '@tanstack/react-query';
import { listAdminBookings } from '../api/adminBookingsApi';
import { adminKeys } from './useAdminStats';
import { STALE_TIME } from '../config/timing';
import type { BookingStatus } from '../types';

/** Admin: read-only platform-wide bookings monitor, optional status filter. */
export function useAdminBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: adminKeys.bookings(status),
    queryFn: () => listAdminBookings(status),
    staleTime: STALE_TIME.short,
  });
}
