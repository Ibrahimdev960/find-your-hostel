import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmPayment,
  listBookingPayments,
  rejectPayment,
  submitPayment,
  type SubmitPaymentInput,
} from '../api/paymentsApi';
import { queryRoots } from '../lib/queryKeys';
import { bookingKeys } from '../features/student/queries/keys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';

export const paymentKeys = {
  all: [queryRoots.payments] as const,
  forBooking: (bookingId: string) => [queryRoots.payments, 'booking', bookingId] as const,
};

export function useBookingPayments(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingId ? paymentKeys.forBooking(bookingId) : paymentKeys.forBooking('none'),
    queryFn: () => listBookingPayments(bookingId as string),
    enabled: Boolean(bookingId),
    staleTime: STALE_TIME.short,
  });
}

/** Invalidate the payment list + both booking views (status moved as a side effect). */
function useBookingPaymentInvalidate() {
  const qc = useQueryClient();
  return (bookingId: string) => {
    void qc.invalidateQueries({ queryKey: paymentKeys.forBooking(bookingId) });
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
    void qc.invalidateQueries({ queryKey: [queryRoots.bookings] });
  };
}

export function useSubmitPayment() {
  const invalidate = useBookingPaymentInvalidate();
  return useMutation({
    mutationFn: (input: SubmitPaymentInput) => submitPayment(input),
    onSuccess: (p) => {
      toast.success('Payment submitted');
      invalidate(p.booking_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useConfirmPayment() {
  const invalidate = useBookingPaymentInvalidate();
  return useMutation({
    mutationFn: (id: string) => confirmPayment(id),
    onSuccess: (p) => {
      toast.success('Payment confirmed');
      invalidate(p.booking_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectPayment() {
  const invalidate = useBookingPaymentInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectPayment(id, reason),
    onSuccess: (p) => {
      toast.success('Payment rejected');
      invalidate(p.booking_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
