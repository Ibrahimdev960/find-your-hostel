/**
 * Root query-key namespaces. Each feature builds its own key factory that extends
 * one of these roots, so cache invalidation stays centralized and collision-free.
 *
 *   export const hostelKeys = {
 *     all: [queryRoots.hostels] as const,
 *     detail: (id: string) => [queryRoots.hostels, 'detail', id] as const,
 *   };
 */
export const queryRoots = {
  auth: 'auth',
  profile: 'profile',
  hostels: 'hostels',
  seatTypes: 'seat-types',
  bookings: 'bookings',
  requests: 'requests',
  offers: 'offers',
  payments: 'payments',
  reviews: 'reviews',
  saved: 'saved',
  community: 'community',
  conversations: 'conversations',
  messages: 'messages',
  notifications: 'notifications',
  promotions: 'promotions',
  reports: 'reports',
  recommendations: 'recommendations',
  admin: 'admin',
} as const;

export type QueryRoot = (typeof queryRoots)[keyof typeof queryRoots];
