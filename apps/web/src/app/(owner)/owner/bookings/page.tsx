'use client';

import Link from 'next/link';
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
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { OwnerPaymentReview } from '@/components/booking/OwnerPaymentReview';

export default function OwnerBookingsPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerId = user?.id ?? '';
  const bookings = useOwnerBookings(user?.id);

  const confirm = useConfirmBooking(ownerId);
  const moveIn = useMarkMovedIn(ownerId);
  const activate = useActivateBooking(ownerId);
  const complete = useCompleteBooking(ownerId);
  const reject = useRejectBooking(ownerId);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/owner">My hostels</Link>
        </Button>
      </div>

      {bookings.isLoading ? (
        <p className="text-sm text-neutral-500">Loading bookings…</p>
      ) : bookings.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No bookings yet across your hostels.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.data?.map((b) => {
            const busy =
              confirm.isPending ||
              moveIn.isPending ||
              activate.isPending ||
              complete.isPending ||
              reject.isPending;
            return (
              <Card key={b.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-neutral-900">
                          {b.hostel?.name ?? 'Hostel'}
                        </span>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {SEAT_TYPE_LABEL[b.occupancy]} · move-in {formatDate(b.move_in_date)} ·{' '}
                        {b.duration_months} mo · {PAYMENT_METHOD_LABEL[b.payment_method]}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right text-sm">
                      <p className="font-semibold text-neutral-900">{formatRent(b.effective_rent)}</p>
                      <p className="text-xs text-neutral-500">
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
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const reason = prompt('Reason for rejection (optional)') ?? undefined;
                            reject.mutate({ id: b.id, reason });
                          }}
                          disabled={busy}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {b.status === 'reserved' && (
                      <Button size="sm" onClick={() => moveIn.mutate(b.id)} disabled={busy}>
                        Mark moved-in
                      </Button>
                    )}
                    {b.status === 'moved_in' && (
                      <Button size="sm" onClick={() => activate.mutate(b.id)} disabled={busy}>
                        Activate
                      </Button>
                    )}
                    {b.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => complete.mutate(b.id)}
                        disabled={busy}
                      >
                        Mark completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
