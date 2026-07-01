'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { useStudentRequests } from '@findyourhostel/shared/features/student';
import {
  formatCurrency,
  formatDate,
  SEAT_TYPE_LABEL,
  type RequestStatus,
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterTabs, type FilterTab } from '@/components/layout/FilterTabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { RequestStatusBadge } from '@/components/request/RequestStatusBadge';

function budgetLabel(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${formatCurrency(min)}–${formatCurrency(max)}`;
  if (max != null) return `up to ${formatCurrency(max)}`;
  if (min != null) return `from ${formatCurrency(min)}`;
  return 'Any budget';
}

type Group = 'all' | 'open' | 'booked' | 'closed';

function groupOf(status: RequestStatus): Exclude<Group, 'all'> {
  if (status === 'open') return 'open';
  if (status === 'booked') return 'booked';
  return 'closed';
}

export default function MyRequestsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const requests = useStudentRequests(user?.id);
  const [group, setGroup] = useState<Group>('all');

  const data = requests.data ?? [];
  const filtered = group === 'all' ? data : data.filter((r) => groupOf(r.status) === group);

  const tabs: FilterTab<Group>[] = [
    { value: 'all', label: 'All', count: data.length },
    { value: 'open', label: 'Open', count: data.filter((r) => groupOf(r.status) === 'open').length },
    { value: 'booked', label: 'Booked', count: data.filter((r) => groupOf(r.status) === 'booked').length },
    { value: 'closed', label: 'Closed', count: data.filter((r) => groupOf(r.status) === 'closed').length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My requests"
        subtitle="Post what you need and let verified owners send you offers."
        actionLabel="Ask hostels"
        actionHref="/requests/new"
        collapsibleTitle
      >
        <FilterTabs tabs={tabs} value={group} onChange={setGroup} />
      </PageHeader>

      {isLoading || !user || requests.isLoading ? (
        <SkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={group === 'all' ? 'No requests yet' : 'Nothing here'}
          description={
            group === 'all'
              ? 'Post a request and owners will come to you with offers.'
              : 'No requests match this filter.'
          }
          action={
            group === 'all' ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild>
                  <Link href="/requests/new">Ask hostels for offers</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/search">Or browse listings</Link>
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const offerCount = r.offers?.[0]?.count ?? 0;
            return (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                className="block rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {[r.city, r.nearest_institution].filter(Boolean).join(' · ') || 'Anywhere'}
                      </span>
                      <RequestStatusBadge status={r.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-foreground-muted">
                      {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any room'} ·{' '}
                      {budgetLabel(r.budget_min, r.budget_max)}
                      {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-semibold text-foreground">{offerCount}</p>
                    <p className="text-xs text-foreground-muted">
                      offer{offerCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
