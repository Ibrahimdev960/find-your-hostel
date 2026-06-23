import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  getReviewForBooking,
  listHostelReviews,
  respondToReview,
  type CreateReviewInput,
} from '../api/reviewsApi';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';

export const reviewKeys = {
  all: [queryRoots.reviews] as const,
  hostel: (hostelId: string) => [queryRoots.reviews, 'hostel', hostelId] as const,
  booking: (bookingId: string) => [queryRoots.reviews, 'booking', bookingId] as const,
};

export function useHostelReviews(hostelId: string | undefined) {
  return useQuery({
    queryKey: hostelId ? reviewKeys.hostel(hostelId) : reviewKeys.hostel('none'),
    queryFn: () => listHostelReviews(hostelId as string),
    enabled: Boolean(hostelId),
    staleTime: STALE_TIME.medium,
  });
}

export function useReviewForBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingId ? reviewKeys.booking(bookingId) : reviewKeys.booking('none'),
    queryFn: () => getReviewForBooking(bookingId as string),
    enabled: Boolean(bookingId),
    staleTime: STALE_TIME.short,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (r) => {
      toast.success('Review posted');
      void qc.invalidateQueries({ queryKey: reviewKeys.hostel(r.hostel_id) });
      void qc.invalidateQueries({ queryKey: reviewKeys.booking(r.booking_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRespondToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      respondToReview(id, response),
    onSuccess: (r) => {
      toast.success('Response posted');
      void qc.invalidateQueries({ queryKey: reviewKeys.hostel(r.hostel_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
