import { queryRoots } from '../../../lib/queryKeys';
import type { SearchFilters } from '../schemas';

export const searchKeys = {
  results: (filters: SearchFilters) => [queryRoots.hostels, 'search', filters] as const,
  public: (id: string) => [queryRoots.hostels, 'public', id] as const,
  availability: (hostelId: string) => [queryRoots.seatTypes, 'availability', hostelId] as const,
};

/** Booking query keys — shared by the student (own bookings) and owner (hostel bookings) views. */
export const bookingKeys = {
  all: [queryRoots.bookings] as const,
  student: (studentId: string) => [queryRoots.bookings, 'student', studentId] as const,
  owner: (ownerId: string) => [queryRoots.bookings, 'owner', ownerId] as const,
  detail: (id: string) => [queryRoots.bookings, 'detail', id] as const,
};

/** Request/offer query keys — shared by the student (own requests) and owner (open feed) views. */
export const requestKeys = {
  all: [queryRoots.requests] as const,
  student: (studentId: string) => [queryRoots.requests, 'student', studentId] as const,
  open: () => [queryRoots.requests, 'open'] as const,
  detail: (id: string) => [queryRoots.requests, 'detail', id] as const,
};

export const offerKeys = {
  all: [queryRoots.offers] as const,
  forRequest: (requestId: string) => [queryRoots.offers, 'request', requestId] as const,
  owner: (ownerId: string) => [queryRoots.offers, 'owner', ownerId] as const,
};
