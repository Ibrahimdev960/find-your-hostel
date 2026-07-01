'use client';

import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import {
  useOwnerBookings,
  useConfirmBooking,
  useMarkMovedIn,
  useActivateBooking,
  useCompleteBooking,
  useRejectBooking,
} from '@findyourhostel/shared/features/owner';
import {
  formatCurrency,
  formatRent,
  formatDate,
  SEAT_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
  type BookingStatus,
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterTabs, type FilterTab } from '@/components/layout/FilterTabs';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { ReasonDialog } from '@/components/ui/reason-dialog';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { OwnerPaymentReview } from '@/components/booking/OwnerPaymentReview';

type Group = 'all' | 'action' | 'active' | 'done';

function groupOf(status: BookingStatus): Exclude<Group, 'all'> {
  if (
    status === 'pending_owner_confirmation' ||
    status === 'awaiting_advance' ||
    status === 'advance_submitted'
  )
    return 'action';
  if (status === 'reserved' || status === 'moved_in' || status === 'active') return 'active';
  return 'done';
}

export default function OwnerBookingsPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerId = user?.id ?? '';
  const bookings = useOwnerBookings(user?.id);
  const [group, setGroup] = useState<Group>('all');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const confirm = useConfirmBooking(ownerId);
  const moveIn = useMarkMovedIn(ownerId);
  const activate = useActivateBooking(ownerId);
  const complete = useCompleteBooking(ownerId);
  const reject = useRejectBooking(ownerId);

  const data = bookings.data ?? [];
  const filtered = group === 'all' ? data : data.filter((b) => groupOf(b.status) === group);
  const tabs: FilterTab<Group>[] = [
    { value: 'all', label: 'All', count: data.length },
    { value: 'action', label: 'Needs action', count: data.filter((b) => groupOf(b.status) === 'action').length },
    { value: 'active', label: 'Active', count: data.filter((b) => groupOf(b.status) === 'active').length },
    { value: 'done', label: 'Closed', count: data.filter((b) => groupOf(b.status) === 'done').length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Bookings"
        subtitle="Confirm payments and manage stays across your hostels."
        collapsibleTitle
      >
        <FilterTabs tabs={tabs} value={group} onChange={setGroup} />
      </PageHeader>

      {isLoading || !user || bookings.isLoading ? (
        <SkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={group === 'all' ? 'No bookings yet' : 'Nothing here'}
          description={
            group === 'all'
              ? 'Bookings across your hostels will appear here.'
              : 'No bookings match this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const busy =
              confirm.isPending ||
              moveIn.isPending ||
              activate.isPending ||
              complete.isPending ||
              reject.isPending;
            return (
              <Panel key={b.id} className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {b.hostel?.name ?? 'Hostel'}
                      </span>
                      <BookingStatusBadge status={b.status} viewer="owner" />
                    </div>
                    <p className="mt-0.5 text-sm text-foreground-muted">
                      {SEAT_TYPE_LABEL[b.occupancy]} · move-in {formatDate(b.move_in_date)} ·{' '}
                      {b.duration_months} mo · {PAYMENT_METHOD_LABEL[b.payment_method]}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-semibold text-foreground">{formatRent(b.effective_rent)}</p>
                    <p className="text-xs text-foreground-muted">
                      advance {formatCurrency(b.advance_amount)}
                    </p>
                  </div>
                </div>

                <OwnerPaymentReview bookingId={b.id} />

                <div className="flex flex-wrap justify-end gap-2">
                  {(b.status === 'pending_owner_confirmation' ||
                    b.status === 'awaiting_advance' ||
                    b.status === 'advance_submitted') && (
                    <>
                      <Button size="sm" onClick={() => confirm.mutate(b.id)} disabled={busy}>
                        Accept booking
                      </Button>
                      <Button
                        size="sm"
                        variant="destructiveGhost"
                        onClick={() => setRejectTarget(b.id)}
                        disabled={busy}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {b.status === 'reserved' && (
                    <Button size="sm" onClick={() => moveIn.mutate(b.id)} disabled={busy}>
                      Mark as moved in
                    </Button>
                  )}
                  {b.status === 'moved_in' && (
                    <Button size="sm" onClick={() => activate.mutate(b.id)} disabled={busy}>
                      Start stay
                    </Button>
                  )}
                  {b.status === 'active' && (
                    <Button size="sm" variant="secondary" onClick={() => complete.mutate(b.id)} disabled={busy}>
                      Mark stay finished
                    </Button>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <ReasonDialog
        open={rejectTarget != null}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        title="Decline this booking?"
        description="The student is told it was declined. Add a short reason so they know why."
        label="Reason (optional)"
        placeholder="e.g. Seat no longer available"
        confirmLabel="Decline booking"
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejectTarget &&
          reject.mutate({ id: rejectTarget, reason }, { onSuccess: () => setRejectTarget(null) })
        }
      />
    </div>
  );
}
