import { cn } from '@/lib/cn';
import { PAYMENT_STATUS_LABEL, paymentStatusTone } from '@findyourhostel/shared';
import type { PaymentStatusValue } from '@findyourhostel/shared';

const TONE: Record<'success' | 'warning' | 'danger' | 'neutral', string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatusValue }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TONE[paymentStatusTone(status)])}>
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}
