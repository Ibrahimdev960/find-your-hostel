import { cn } from '@/lib/cn';
import type { HostelStatus } from '@findyourhostel/shared';

const STYLES: Record<HostelStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  pending: 'bg-warning/10 text-warning',
  verified: 'bg-brand-50 text-brand-700',
  published: 'bg-success/10 text-success',
  unpublished: 'bg-neutral-200 text-neutral-700',
  rejected: 'bg-danger/10 text-danger',
};

const LABELS: Record<HostelStatus, string> = {
  draft: 'Draft',
  pending: 'Pending review',
  verified: 'Verified',
  published: 'Published',
  unpublished: 'Unpublished',
  rejected: 'Rejected',
};

export function HostelStatusBadge({ status }: { status: HostelStatus }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
