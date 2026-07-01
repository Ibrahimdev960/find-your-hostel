'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  useHostelPublic,
  useSeatAvailability,
  useCreateBooking,
  createBookingSchema,
} from '@findyourhostel/shared/features/student';
import {
  computePriceBreakdown,
  formatCurrency,
  formatRent,
  parseZodErrors,
  PAYMENT_METHOD_LABEL,
  SEAT_TYPE_LABEL,
} from '@findyourhostel/shared';
import type { PaymentMethod } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const PAYMENT_METHODS: PaymentMethod[] = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'];

export default function ConfirmBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const seatId = useSearchParams().get('seat') ?? undefined;

  const { user, isLoading: authLoading } = useRequireAuth('student');
  const hostel = useHostelPublic(id);
  const availability = useSeatAvailability(id);
  const createBooking = useCreateBooking(user?.id ?? '');

  const [moveInDate, setMoveInDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const seat = useMemo(
    () => hostel.data?.seat_types.find((s) => s.id === seatId),
    [hostel.data, seatId]
  );
  const seatAvail = availability.data?.find((a) => a.seat_type_id === seatId);
  const price = seat
    ? computePriceBreakdown(Number(seat.monthly_rent), Number(seat.discount_percent) / 100)
    : null;

  const soldOut = seatAvail != null && seatAvail.available_seats <= 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seat) return;
    const parsed = createBookingSchema.safeParse({
      seat_type_id: seat.id,
      move_in_date: moveInDate,
      duration_months: durationMonths,
      payment_method: paymentMethod,
      special_requests: specialRequests || undefined,
      agree_terms: agreeTerms,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    createBooking.mutate(parsed.data, {
      onSuccess: (booking) => router.push(`/bookings/${booking.id}`),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <Link
          href={`/hostels/${id}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:bg-background-secondary"
          aria-label="Back to hostel"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="truncate text-sm font-semibold text-foreground">
          {hostel.data?.name ?? 'Confirm booking'}
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {authLoading || !user || hostel.isLoading ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-background-secondary" />
        ) : !hostel.data || !seat || !price ? (
          <Panel className="items-center px-6 py-12 text-center">
            <p className="text-sm text-foreground-muted">
              This seat type isn&apos;t available.{' '}
              <Link href={`/hostels/${id}`} className="text-primary hover:underline">
                Back to hostel
              </Link>
            </p>
          </Panel>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Confirm booking</h1>
              <p className="mt-1 text-sm text-foreground-muted">
                {SEAT_TYPE_LABEL[seat.occupancy]} seat · {seat.is_ac ? 'AC' : 'Non-AC'}
                {seat.attached_bath ? ' · Attached bath' : ''}
                {seatAvail != null && (
                  <span className={soldOut ? 'ml-2 text-error' : 'ml-2 text-success'}>
                    {soldOut ? 'Fully booked' : `${seatAvail.available_seats} seat(s) left`}
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem]">
              <Panel className="space-y-4 p-5 sm:p-6">
                <Field label="Move-in date" htmlFor="move_in_date" error={errors.move_in_date}>
                  <Input id="move_in_date" type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
                </Field>
                <Field label="Duration (months)" htmlFor="duration_months" error={errors.duration_months}>
                  <Input
                    id="duration_months"
                    type="number"
                    min={1}
                    max={24}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </Field>
                <Field label="Payment method" htmlFor="payment_method" error={errors.payment_method}>
                  <Select
                    id="payment_method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {PAYMENT_METHOD_LABEL[m]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Special requests (optional)" htmlFor="special_requests" error={errors.special_requests}>
                  <Textarea
                    id="special_requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Anything the owner should know?"
                  />
                </Field>
                <div className="flex items-start gap-3">
                  <Switch checked={agreeTerms} onCheckedChange={setAgreeTerms} aria-label="Agree to booking terms" />
                  <span className="text-sm text-foreground-secondary">
                    I agree to the booking terms. The booking deposit holds your seat; the
                    remaining rent and refundable deposit are paid when you move in.
                  </span>
                </div>
                {errors.agree_terms && <p className="text-xs text-error">{errors.agree_terms}</p>}
              </Panel>

              <Panel className="h-fit p-5 sm:p-6 md:sticky md:top-6">
                <h2 className="text-base font-semibold text-foreground">Price breakdown</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label="Monthly rent" value={formatRent(price.monthlyRent)} />
                  <Row label="Booking deposit (20%)" value={formatCurrency(price.advance)} strong />
                  <p className="-mt-1 text-xs text-foreground-muted">Pay this now to hold your seat.</p>
                  <Row label="Remaining rent" value={formatCurrency(price.balance)} />
                  <Row label="Refundable deposit" value={formatCurrency(price.securityDeposit)} />
                  <p className="-mt-1 text-xs text-foreground-muted">Returned when you leave.</p>
                  <div className="border-t border-border pt-2">
                    <Row label="To pay when you move in" value={formatCurrency(price.dueAtMoveIn)} strong />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="mt-4 hidden w-full md:inline-flex"
                  disabled={createBooking.isPending || soldOut}
                >
                  {soldOut ? 'Fully booked' : createBooking.isPending ? 'Booking…' : 'Confirm booking'}
                </Button>
                <p className="mt-2 hidden text-xs text-foreground-muted md:block">
                  Pay the booking deposit of {formatCurrency(price.advance)} to hold this seat.
                </p>
              </Panel>

              {/* Mobile sticky action bar — keeps the total + Confirm reachable. */}
              <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-foreground-muted">Deposit to hold seat</p>
                    <p className="truncate text-base font-semibold text-foreground">
                      {formatCurrency(price.advance)}
                    </p>
                  </div>
                  <Button type="submit" disabled={createBooking.isPending || soldOut}>
                    {soldOut ? 'Fully booked' : createBooking.isPending ? 'Booking…' : 'Confirm'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-muted">{label}</span>
      <span className={strong ? 'font-semibold text-foreground' : 'text-foreground-secondary'}>
        {value}
      </span>
    </div>
  );
}
