import { bookingStatusPlain, bookingStatusTone } from '@findyourhostel/shared';
import type { BookingStatus, Viewer } from '@findyourhostel/shared';
import { StatusPill } from '@/components/ui/badge';

export function BookingStatusBadge({
  status,
  viewer = 'student',
}: {
  status: BookingStatus;
  viewer?: Viewer;
}) {
  return <StatusPill tone={bookingStatusTone(status)}>{bookingStatusPlain(status, viewer)}</StatusPill>;
}
