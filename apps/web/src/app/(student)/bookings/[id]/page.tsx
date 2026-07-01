'use client';

import { use, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
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
  PAYMENT_STAGE_PLAIN,
  MONEY_LABEL,
} from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Panel, PanelSection } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/dialog';
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
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading || !user || booking.isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Booking" useBackNavigation backFallbackHref="/bookings" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking.data) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Booking not found" useBackNavigation backFallbackHref="/bookings" />
        <EmptyState icon={CalendarCheck} title="Booking not found" description="It may have been removed." />
      </div>
    );
  }

  const b = booking.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <PageHeader
        title={b.hostel?.name ?? 'Hostel'}
        subtitle={
          [b.hostel?.city, b.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
          'Location n/a'
        }
        useBackNavigation
        backFallbackHref="/bookings"
      />

      <PanelSection title="Booking details" action={<BookingStatusBadge status={b.status} />}>
        <div className="space-y-2 text-sm">
          <Row label="Room type" value={`${SEAT_TYPE_LABEL[b.occupancy]} · ${formatRent(b.effective_rent)}`} />
          <Row label="Move-in date" value={formatDate(b.move_in_date)} />
          <Row label="Duration" value={`${b.duration_months} month(s)`} />
          <Row label="Payment method" value={PAYMENT_METHOD_LABEL[b.payment_method]} />
          {b.special_requests && <Row label="Special requests" value={b.special_requests} />}
          {b.cancel_reason && <Row label="Reason" value={b.cancel_reason} />}
        </div>
      </PanelSection>

      <PanelSection title="Payment">
        <div className="space-y-2 text-sm">
          <Row label={MONEY_LABEL.advance} value={formatCurrency(b.advance_amount)} strong />
          <Row label={MONEY_LABEL.balance} value={formatCurrency(b.balance_amount)} />
          <Row label={MONEY_LABEL.securityDeposit} value={formatCurrency(b.security_deposit)} />

          {(payments.data?.length ?? 0) > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              {payments.data?.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-foreground-secondary">
                    {PAYMENT_STAGE_PLAIN[p.stage]} · {formatCurrency(p.amount)}
                    {p.rejection_reason ? ` — ${p.rejection_reason}` : ''}
                  </span>
                  <PaymentStatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}

          {(() => {
            const due = duePaymentStage(b.status);
            if (!due) return null;
            const live = payments.data?.find((p) => p.stage === due && p.status !== 'rejected');
            if (live) return null;
            const amount = due === 'advance' ? b.advance_amount : b.balance_amount + b.security_deposit;
            return (
              <div className="pt-2">
                <PaymentForm bookingId={b.id} stage={due} amount={amount} />
              </div>
            );
          })()}
        </div>
      </PanelSection>

      {(b.status === 'active' || b.status === 'completed') && (
        <PanelSection title="Your review">
          {review.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : review.data ? (
            <div className="space-y-1">
              <Stars value={review.data.rating_overall} />
              {review.data.comment && (
                <p className="text-sm text-foreground-secondary">{review.data.comment}</p>
              )}
              <p className="text-xs text-foreground-muted">Thanks for reviewing your stay.</p>
            </div>
          ) : (
            <ReviewForm bookingId={b.id} />
          )}
        </PanelSection>
      )}

      {isCancellable(b.status) && (
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Cancel this booking</p>
              <p className="text-xs text-foreground-muted">This can&apos;t be undone.</p>
            </div>
            <Button variant="destructiveGhost" onClick={() => setConfirmCancel(true)} disabled={cancel.isPending}>
              Cancel booking
            </Button>
          </div>
        </Panel>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        description="This releases your seat and cannot be undone."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate({ id: b.id }, { onSuccess: () => setConfirmCancel(false) })}
      />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-foreground-muted">{label}</span>
      <span className={strong ? 'font-semibold text-foreground' : 'text-foreground-secondary'}>
        {value}
      </span>
    </div>
  );
}
