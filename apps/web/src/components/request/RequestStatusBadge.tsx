import {
  REQUEST_STATUS_PLAIN,
  offerStatusPlain,
  requestStatusTone,
  offerStatusTone,
} from '@findyourhostel/shared';
import type { RequestStatus, OfferStatus, Viewer } from '@findyourhostel/shared';
import { StatusPill } from '@/components/ui/badge';

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <StatusPill tone={requestStatusTone(status)}>{REQUEST_STATUS_PLAIN[status]}</StatusPill>;
}

export function OfferStatusBadge({
  status,
  viewer = 'student',
}: {
  status: OfferStatus;
  viewer?: Viewer;
}) {
  return <StatusPill tone={offerStatusTone(status)}>{offerStatusPlain(status, viewer)}</StatusPill>;
}
