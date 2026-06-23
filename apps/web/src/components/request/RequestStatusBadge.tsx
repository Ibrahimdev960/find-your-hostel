import { cn } from '@/lib/cn';
import {
  REQUEST_STATUS_LABEL,
  OFFER_STATUS_LABEL,
  requestStatusTone,
  offerStatusTone,
} from '@findyourhostel/shared';
import type { RequestStatus, OfferStatus } from '@findyourhostel/shared';

const TONE: Record<'success' | 'warning' | 'danger' | 'neutral', string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-100 text-neutral-600',
};

const base = 'rounded-full px-2.5 py-0.5 text-xs font-medium';

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <span className={cn(base, TONE[requestStatusTone(status)])}>{REQUEST_STATUS_LABEL[status]}</span>;
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  return <span className={cn(base, TONE[offerStatusTone(status)])}>{OFFER_STATUS_LABEL[status]}</span>;
}
