import { cn } from '@/lib/cn';
import { BOOKING_STATUS_LABEL, bookingStatusTone } from '@findyourhostel/shared';
import type { BookingStatus } from '@findyourhostel/shared';

const TONE_STYLES: Record<ReturnType<typeof bookingStatusTone>, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_STYLES[bookingStatusTone(status)]
      )}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}
