'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateRequest, createRequestSchema } from '@findyourhostel/shared/features/student';
import { parseZodErrors, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SEAT_OPTIONS = ['single', 'double', 'triple', 'quad', 'dormitory'] as const;
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'co_living', label: 'Co-living' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth('student');
  const create = useCreateRequest(user?.id ?? '');

  const [form, setForm] = useState({
    hostel_type: '',
    seat_type: '',
    city: '',
    nearest_institution: '',
    budget_min: '',
    budget_max: '',
    move_in_date: '',
    duration_months: '1',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createRequestSchema.safeParse({
      hostel_type: form.hostel_type || undefined,
      seat_type: form.seat_type || undefined,
      city: form.city || undefined,
      nearest_institution: form.nearest_institution || undefined,
      budget_min: form.budget_min || undefined,
      budget_max: form.budget_max || undefined,
      move_in_date: form.move_in_date || undefined,
      duration_months: form.duration_months,
      notes: form.notes || undefined,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    create.mutate(parsed.data, { onSuccess: () => router.push('/requests') });
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-8">
      <Link href="/requests" className="text-sm text-brand-600 hover:underline">
        ← My requests
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">Post a hostel request</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Tell owners what you need and let verified owners send you offers.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="hostel_type" error={errors.hostel_type}>
            <Select id="hostel_type" value={form.hostel_type} onChange={set('hostel_type')}>
              <option value="">Any</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seat type" htmlFor="seat_type" error={errors.seat_type}>
            <Select id="seat_type" value={form.seat_type} onChange={set('seat_type')}>
              <option value="">Any</option>
              {SEAT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {SEAT_TYPE_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City" htmlFor="city" error={errors.city}>
            <Input id="city" value={form.city} onChange={set('city')} placeholder="e.g. Lahore" />
          </Field>
          <Field label="Nearest institution" htmlFor="nearest_institution" error={errors.nearest_institution}>
            <Input
              id="nearest_institution"
              value={form.nearest_institution}
              onChange={set('nearest_institution')}
              placeholder="e.g. UET"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Budget min (PKR/mo)" htmlFor="budget_min" error={errors.budget_min}>
            <Input id="budget_min" type="number" min={0} value={form.budget_min} onChange={set('budget_min')} />
          </Field>
          <Field label="Budget max (PKR/mo)" htmlFor="budget_max" error={errors.budget_max}>
            <Input id="budget_max" type="number" min={0} value={form.budget_max} onChange={set('budget_max')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Move-in date" htmlFor="move_in_date" error={errors.move_in_date}>
            <Input id="move_in_date" type="date" value={form.move_in_date} onChange={set('move_in_date')} />
          </Field>
          <Field label="Duration (months)" htmlFor="duration_months" error={errors.duration_months}>
            <Input
              id="duration_months"
              type="number"
              min={1}
              max={24}
              value={form.duration_months}
              onChange={set('duration_months')}
            />
          </Field>
        </div>

        <Field label="Notes (optional)" htmlFor="notes" error={errors.notes}>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Anything else owners should know?"
          />
        </Field>

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Posting…' : 'Post request'}
        </Button>
      </form>
    </main>
  );
}
