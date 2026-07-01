import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateBooking,
  completeBooking,
  confirmBooking,
  listOwnerBookings,
  markMovedIn,
  rejectBooking,
} from '../api/ownerBookingsApi';
import { bookingKeys } from '../../student/queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';

export function useOwnerBookings(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? bookingKeys.owner(ownerId) : bookingKeys.owner('anon'),
    queryFn: () => listOwnerBookings(ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: STALE_TIME.short,
  });
}

/** Shared owner-action mutation factory (confirm/move-in/activate/complete/reject). */
function useBookingAction(
  fn: (id: string) => Promise<{ id: string; owner_id: string; hostel_id: string }>,
  successMsg: string,
  ownerId: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fn(id),
    onSuccess: (b) => {
      toast.success(successMsg);
      void qc.invalidateQueries({ queryKey: bookingKeys.owner(ownerId) });
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(b.id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useConfirmBooking = (ownerId: string) =>
  useBookingAction(confirmBooking, 'Booking accepted. The student has been notified.', ownerId);
export const useMarkMovedIn = (ownerId: string) =>
  useBookingAction(markMovedIn, 'Marked as moved in. The balance is now due.', ownerId);
export const useActivateBooking = (ownerId: string) =>
  useBookingAction(activateBooking, 'Stay started. The student can now review it.', ownerId);
export const useCompleteBooking = (ownerId: string) =>
  useBookingAction(completeBooking, 'Stay marked finished.', ownerId);

export function useRejectBooking(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectBooking(id, reason),
    onSuccess: (b) => {
      toast.success('Booking declined. The student has been notified.');
      void qc.invalidateQueries({ queryKey: bookingKeys.owner(ownerId) });
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(b.id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
