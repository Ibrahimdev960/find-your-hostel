import { HOSTEL_STATUS_PLAIN } from '@findyourhostel/shared';
import type { HostelStatus } from '@findyourhostel/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const TONE: Record<HostelStatus, NonNullable<BadgeProps['tone']>> = {
  draft: 'neutral',
  pending: 'warning',
  verified: 'primary',
  published: 'success',
  unpublished: 'neutral',
  rejected: 'danger',
};

export function HostelStatusBadge({ status }: { status: HostelStatus }) {
  return <Badge tone={TONE[status]}>{HOSTEL_STATUS_PLAIN[status]}</Badge>;
}
