'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBooking, useCancelBooking } from '@findyourhostel/shared/features/student';
import { useBookingPayments, useReviewForBooking } from '@findyourhostel/shared/hooks';
import {
  isCancellable,
  duePaymentStage,
  formatCurrency,
  formatRent,
  formatDate,
  SEAT_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STAGE_LABEL,
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { PaymentStatusBadge } from '@/components/booking/PaymentStatusBadge';
import { PaymentForm } from '@/components/booking/PaymentForm';
import { ReviewForm } from '@/components/review/ReviewForm';
import { Stars } from '@/components/review/Stars';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading } = useRequireAuth('student');
  const booking = useBooking(id);
  const payments = useBookingPayments(id);
  const review = useReviewForBooking(id);
  const cancel = useCancelBooking(user?.id ?? '');

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (booking.isLoading) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (!booking.data) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500">
        Booking not found.{' '}
        <Link href="/bookings" className="text-brand-600 hover:underline">
          My bookings
        </Link>
      </div>
    );
  }

  const b = booking.data;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <Link href="/bookings" className="text-sm text-brand-600 hover:underline">
        ← My bookings
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{b.hostel?.name ?? 'Hostel'}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {[b.hostel?.city, b.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
              'Location n/a'}
          </p>
        </div>
        <BookingStatusBadge status={b.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Seat type" value={`${SEAT_TYPE_LABEL[b.occupancy]} · ${formatRent(b.effective_rent)}`} />
          <Row label="Move-in date" value={formatDate(b.move_in_date)} />
          <Row label="Duration" value={`${b.duration_months} month(s)`} />
          <Row label="Payment method" value={PAYMENT_METHOD_LABEL[b.payment_method]} />
          {b.special_requests && <Row label="Special requests" value={b.special_requests} />}
          {b.cancel_reason && <Row label="Reason" value={b.cancel_reason} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Advance (20%)" value={formatCurrency(b.advance_amount)} strong />
          <Row label="Balance (80%)" value={formatCurrency(b.balance_amount)} />
          <Row label="Security deposit" value={formatCurrency(b.security_deposit)} />

          {/* Payment timeline */}
          {(payments.data?.length ?? 0) > 0 && (
            <div className="space-y-2 border-t border-neutral-200 pt-3">
              {payments.data?.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-neutral-600">
                    {PAYMENT_STAGE_LABEL[p.stage]} · {formatCurrency(p.amount)}
                    {p.rejection_reason ? ` — ${p.rejection_reason}` : ''}
                  </span>
                  <PaymentStatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}

          {/* Submit form for the stage that's currently due (no live payment yet) */}
          {(() => {
            const due = duePaymentStage(b.status);
            if (!due) return null;
            const live = payments.data?.find((p) => p.stage === due && p.status !== 'rejected');
            if (live) return null;
            const amount = due === 'advance' ? b.advance_amount : b.balance_amount + b.security_deposit;
            return <PaymentForm bookingId={b.id} stage={due} amount={amount} />;
          })()}
        </CardContent>
      </Card>

      {(b.status === 'active' || b.status === 'completed') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your review</CardTitle>
          </CardHeader>
          <CardContent>
            {review.isLoading ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : review.data ? (
              <div className="space-y-1">
                <Stars value={review.data.rating_overall} />
                {review.data.comment && (
                  <p className="text-sm text-neutral-700">{review.data.comment}</p>
                )}
                <p className="text-xs text-neutral-400">Thanks for reviewing your stay.</p>
              </div>
            ) : (
              <ReviewForm bookingId={b.id} />
            )}
          </CardContent>
        </Card>
      )}

      {isCancellable(b.status) && (
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm('Cancel this booking? This cannot be undone.'))
              cancel.mutate({ id: b.id });
          }}
          disabled={cancel.isPending}
        >
          {cancel.isPending ? 'Cancelling…' : 'Cancel booking'}
        </Button>
      )}
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-500">{label}</span>
      <span className={strong ? 'font-semibold text-neutral-900' : 'text-neutral-700'}>{value}</span>
    </div>
  );
}
