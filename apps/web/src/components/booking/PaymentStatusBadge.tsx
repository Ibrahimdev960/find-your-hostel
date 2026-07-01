import { paymentStatusPlain, paymentStatusTone } from '@findyourhostel/shared';
import type { PaymentStatusValue, Viewer } from '@findyourhostel/shared';
import { StatusPill } from '@/components/ui/badge';

export function PaymentStatusBadge({
  status,
  viewer = 'student',
}: {
  status: PaymentStatusValue;
  viewer?: Viewer;
}) {
  return <StatusPill tone={paymentStatusTone(status)}>{paymentStatusPlain(status, viewer)}</StatusPill>;
}
