'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

  if (authLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (hostel.isLoading) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (!hostel.data || !seat || !price) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500">
        This seat type isn’t available.{' '}
        <Link href={`/hostels/${id}`} className="text-brand-600 hover:underline">
          Back to hostel
        </Link>
      </div>
    );
  }

  const soldOut = seatAvail != null && seatAvail.available_seats <= 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href={`/hostels/${id}`} className="text-sm text-brand-600 hover:underline">
        ← Back to {hostel.data.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">Confirm booking</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {SEAT_TYPE_LABEL[seat.occupancy]} seat · {seat.is_ac ? 'AC' : 'Non-AC'}
        {seat.attached_bath ? ' · Attached bath' : ''}
        {seatAvail != null && (
          <span className={soldOut ? 'ml-2 text-danger' : 'ml-2 text-success'}>
            {soldOut ? 'Fully booked' : `${seatAvail.available_seats} seat(s) left`}
          </span>
        )}
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-6 md:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <Field label="Move-in date" htmlFor="move_in_date" error={errors.move_in_date}>
            <Input
              id="move_in_date"
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
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

          <Field
            label="Special requests (optional)"
            htmlFor="special_requests"
            error={errors.special_requests}
          >
            <Textarea
              id="special_requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Anything the owner should know?"
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I agree to the booking terms. The advance reserves the seat; the balance and
              security deposit are due at move-in.
            </span>
          </label>
          {errors.agree_terms && <p className="text-xs text-danger">{errors.agree_terms}</p>}
        </div>

        {/* Price breakdown */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Price breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Monthly rent" value={formatRent(price.monthlyRent)} />
            <Row label="Advance (20%)" value={formatCurrency(price.advance)} strong />
            <Row label="Balance (80%)" value={formatCurrency(price.balance)} />
            <Row label="Security deposit" value={formatCurrency(price.securityDeposit)} />
            <div className="border-t border-neutral-200 pt-2">
              <Row label="Due at move-in" value={formatCurrency(price.dueAtMoveIn)} strong />
            </div>
            <Button type="submit" className="mt-2 w-full" disabled={createBooking.isPending || soldOut}>
              {soldOut ? 'Fully booked' : createBooking.isPending ? 'Booking…' : 'Confirm booking'}
            </Button>
            <p className="text-xs text-neutral-500">
              Pay the advance of {formatCurrency(price.advance)} to reserve this seat.
            </p>
          </CardContent>
        </Card>
      </form>
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className={strong ? 'font-semibold text-neutral-900' : 'text-neutral-700'}>{value}</span>
    </div>
  );
}
