import type { Notification } from '../types';

/**
 * Role-aware deep link for a notification (CLAUDE.md §4.13). Maps the type + `data`
 * payload to the right in-app route; both web and mobile reuse this mapping.
 */
export function notificationHref(n: Pick<Notification, 'type' | 'data'>): string {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const hostelId = typeof data.hostel_id === 'string' ? data.hostel_id : undefined;
  const bookingId = typeof data.booking_id === 'string' ? data.booking_id : undefined;
  const requestId = typeof data.request_id === 'string' ? data.request_id : undefined;

  switch (n.type) {
    case 'hostel_approved':
    case 'hostel_rejected':
      return hostelId ? `/owner/hostels/${hostelId}/edit` : '/owner';
    case 'booking_created':
    case 'booking_cancelled':
    case 'payment_submitted':
      return '/owner/bookings';
    case 'booking_status':
    case 'payment_confirmed':
    case 'payment_rejected':
      return bookingId ? `/bookings/${bookingId}` : '/bookings';
    case 'offer_received':
      return requestId ? `/requests/${requestId}` : '/requests';
    case 'offer_accepted':
      return '/owner/requests';
    default:
      return '/notifications';
  }
}
