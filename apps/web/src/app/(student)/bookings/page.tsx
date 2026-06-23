'use client';

import Link from 'next/link';
import { useStudentBookings } from '@findyourhostel/shared/features/student';
import { formatRent, formatCurrency, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';

export default function MyBookingsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const bookings = useStudentBookings(user?.id);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">My bookings</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/search">Find a hostel</Link>
        </Button>
      </div>

      {bookings.isLoading ? (
        <p className="text-sm text-neutral-500">Loading your bookings…</p>
      ) : bookings.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No bookings yet.{' '}
            <Link href="/search" className="text-brand-600 hover:underline">
              Search for a hostel
            </Link>{' '}
            to book a seat.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.data?.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} className="block">
              <Card className="transition-colors hover:border-brand-300">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-neutral-900">
                        {b.hostel?.name ?? 'Hostel'}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-neutral-500">
                      {SEAT_TYPE_LABEL[b.occupancy]} · move-in {formatDate(b.move_in_date)} ·{' '}
                      {b.duration_months} mo
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right text-sm">
                    <p className="font-semibold text-neutral-900">{formatRent(b.effective_rent)}</p>
                    <p className="text-xs text-neutral-500">advance {formatCurrency(b.advance_amount)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
