'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCreateRequest, createRequestSchema } from '@findyourhostel/shared/features/student';
import { parseZodErrors, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Panel } from '@/components/ui/panel';
import { Skeleton } from '@/components/ui/skeleton';

const SEAT_OPTIONS = ['single', 'double', 'triple', 'quad', 'dormitory'] as const;
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'co_living', label: 'Mixed / Family' },
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
  const [showMore, setShowMore] = useState(false);

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
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <PageHeader
        title="Ask hostels for offers"
        subtitle="Tell owners what you need and let approved owners send you offers."
        centerTitle
        useBackNavigation
        backFallbackHref="/requests"
      />

      {isLoading || !user ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Panel className="p-5 sm:p-6">
          <div className="mb-4 rounded-2xl bg-background-secondary/60 p-4 text-sm text-foreground-secondary">
            <p className="font-semibold text-foreground">What happens after you post</p>
            <p className="mt-1">
              Approved owners near you can send offers. You pick the one you like — the others
              are declined automatically. Posting is free and you&apos;re not committed until you
              accept an offer.
            </p>
            <p className="mt-2 text-xs text-foreground-muted">
              Owners can&apos;t see your name or phone number until you accept an offer.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {/* Essentials — the few things owners really need to send an offer. */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input id="city" value={form.city} onChange={set('city')} placeholder="e.g. Lahore" />
              </Field>
              <Field label="Your college or university" htmlFor="nearest_institution" error={errors.nearest_institution}>
                <Input
                  id="nearest_institution"
                  value={form.nearest_institution}
                  onChange={set('nearest_institution')}
                  placeholder="e.g. UET"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Budget (PKR/mo)"
                htmlFor="budget_max"
                error={errors.budget_max}
                hint="The most you can pay each month"
              >
                <Input id="budget_max" type="number" min={0} value={form.budget_max} onChange={set('budget_max')} />
              </Field>
              <Field label="Room type" htmlFor="seat_type" error={errors.seat_type}>
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

            {/* Advanced — optional, hidden by default to keep the form short. */}
            <div>
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                More options (optional)
              </button>

              {showMore && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <Field label="Lowest budget (PKR/mo)" htmlFor="budget_min" error={errors.budget_min}>
                      <Input id="budget_min" type="number" min={0} value={form.budget_min} onChange={set('budget_min')} />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Move-in date" htmlFor="move_in_date" error={errors.move_in_date}>
                      <Input id="move_in_date" type="date" value={form.move_in_date} onChange={set('move_in_date')} />
                    </Field>
                    <Field label="How many months?" htmlFor="duration_months" error={errors.duration_months}>
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

                  <Field label="Anything else? (optional)" htmlFor="notes" error={errors.notes}>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={set('notes')}
                      placeholder="Anything else owners should know?"
                    />
                  </Field>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
