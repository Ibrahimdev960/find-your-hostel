'use client';

import { useState } from 'react';
import { useSubmitOffer } from '@findyourhostel/shared/features/owner';
import { submitOfferSchema } from '@findyourhostel/shared/features/owner';
import { parseZodErrors } from '@findyourhostel/shared';
import type { Hostel } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/** Inline form an owner uses to send one offer on an open request. */
export function SubmitOfferForm({
  requestId,
  ownerId,
  hostels,
}: {
  requestId: string;
  ownerId: string;
  hostels: Hostel[];
}) {
  const submit = useSubmitOffer(ownerId);
  const [hostelId, setHostelId] = useState('');
  const [rent, setRent] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (hostels.length === 0) {
    return <p className="text-sm text-foreground-muted">List a hostel first to send offers.</p>;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = submitOfferSchema.safeParse({
      request_id: requestId,
      hostel_id: hostelId,
      monthly_rent: rent,
      message: message || undefined,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    submit.mutate(parsed.data, {
      onSuccess: () => {
        setHostelId('');
        setRent('');
        setMessage('');
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 border-t border-border pt-3">
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
        <Field label="Hostel" htmlFor={`hostel-${requestId}`} error={errors.hostel_id}>
          <Select
            id={`hostel-${requestId}`}
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
          >
            <option value="">Select a hostel</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Monthly rent (PKR)" htmlFor={`rent-${requestId}`} error={errors.monthly_rent}>
          <Input
            id={`rent-${requestId}`}
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Message (optional)" htmlFor={`msg-${requestId}`} error={errors.message}>
        <Textarea
          id={`msg-${requestId}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the student why your hostel is a good fit"
        />
      </Field>
      <Button type="submit" size="sm" disabled={submit.isPending}>
        {submit.isPending ? 'Sending…' : 'Send offer'}
      </Button>
    </form>
  );
}
