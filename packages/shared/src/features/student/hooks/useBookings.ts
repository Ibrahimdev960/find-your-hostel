import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelBooking,
  createBooking,
  getBooking,
  getSeatAvailability,
  listStudentBookings,
} from '../api/bookingsApi';
import { bookingKeys, searchKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { CreateBookingInput } from '../schemas';

/** Live seat availability for a hostel's seat types. */
export function useSeatAvailability(hostelId: string | undefined) {
  return useQuery({
    queryKey: hostelId ? searchKeys.availability(hostelId) : searchKeys.availability('none'),
    queryFn: () => getSeatAvailability(hostelId as string),
    enabled: Boolean(hostelId),
    staleTime: STALE_TIME.short,
  });
}

/** The current student's bookings. */
export function useStudentBookings(studentId: string | undefined) {
  return useQuery({
    queryKey: studentId ? bookingKeys.student(studentId) : bookingKeys.student('anon'),
    queryFn: () => listStudentBookings(studentId as string),
    enabled: Boolean(studentId),
    staleTime: STALE_TIME.short,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: id ? bookingKeys.detail(id) : bookingKeys.detail('none'),
    queryFn: () => getBooking(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME.short,
  });
}

export function useCreateBooking(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(studentId, input),
    onSuccess: (b) => {
      toast.success('Booking started! Check My Bookings for your next step.');
      void qc.invalidateQueries({ queryKey: bookingKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: searchKeys.availability(b.hostel_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelBooking(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelBooking(id, reason),
    onSuccess: (b) => {
      toast.success('Booking cancelled. Your seat has been released.');
      void qc.invalidateQueries({ queryKey: bookingKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(b.id) });
      void qc.invalidateQueries({ queryKey: searchKeys.availability(b.hostel_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
