'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck } from 'lucide-react';
import { useStudentBookings } from '@findyourhostel/shared/features/student';
import {
  formatRent,
  formatCurrency,
  formatDate,
  SEAT_TYPE_LABEL,
  type BookingStatus,
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterTabs, type FilterTab } from '@/components/layout/FilterTabs';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

type Group = 'all' | 'active' | 'pending' | 'completed' | 'cancelled';

/** Coarse grouping of the fine-grained booking lifecycle for the filter tabs. */
function groupOf(status: BookingStatus): Exclude<Group, 'all'> {
  if (status === 'active' || status === 'reserved' || status === 'moved_in') return 'active';
  if (status === 'completed') return 'completed';
  if (status === 'cancelled' || status === 'rejected' || status === 'expired' || status === 'advance_rejected')
    return 'cancelled';
  return 'pending';
}

export default function MyBookingsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const bookings = useStudentBookings(user?.id);
  const [group, setGroup] = useState<Group>('all');

  const data = useMemo(() => bookings.data ?? [], [bookings.data]);
  const filtered = group === 'all' ? data : data.filter((b) => groupOf(b.status) === group);

  const tabs: FilterTab<Group>[] = [
    { value: 'all', label: 'All', count: data.length },
    { value: 'active', label: 'Active', count: data.filter((b) => groupOf(b.status) === 'active').length },
    { value: 'pending', label: 'Pending', count: data.filter((b) => groupOf(b.status) === 'pending').length },
    { value: 'completed', label: 'Completed', count: data.filter((b) => groupOf(b.status) === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: data.filter((b) => groupOf(b.status) === 'cancelled').length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My bookings"
        subtitle="Track and manage the seats you've booked."
        actionLabel="Search hostels"
        actionHref="/search"
        collapsibleTitle
      >
        <FilterTabs tabs={tabs} value={group} onChange={setGroup} />
      </PageHeader>

      {isLoading || !user || bookings.isLoading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={group === 'all' ? 'No bookings yet' : 'Nothing here'}
          description={
            group === 'all'
              ? 'Search for a hostel and book a seat to see it here.'
              : 'No bookings match this filter.'
          }
          action={
            group === 'all' ? (
              <Button asChild>
                <Link href="/search">Search hostels</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="block rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground">
                      {b.hostel?.name ?? 'Hostel'}
                    </span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground-muted">
                    {SEAT_TYPE_LABEL[b.occupancy]} · move-in {formatDate(b.move_in_date)} ·{' '}
                    {b.duration_months} mo
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-semibold text-foreground">{formatRent(b.effective_rent)}</p>
                  <p className="text-xs text-foreground-muted">
                    advance {formatCurrency(b.advance_amount)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
