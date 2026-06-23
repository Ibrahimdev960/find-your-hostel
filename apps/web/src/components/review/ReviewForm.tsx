'use client';

import { useState } from 'react';
import { useCreateReview } from '@findyourhostel/shared/hooks';
import { createReviewSchema } from '@findyourhostel/shared/api';
import { parseZodErrors } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { StarInput } from '@/components/review/Stars';

const CRITERIA = [
  { key: 'rating_cleanliness', label: 'Cleanliness' },
  { key: 'rating_facilities', label: 'Facilities' },
  { key: 'rating_location', label: 'Location' },
  { key: 'rating_value', label: 'Value' },
] as const;

/** Student review form for a completed/active booking. */
export function ReviewForm({ bookingId }: { bookingId: string }) {
  const create = useCreateReview();
  const [overall, setOverall] = useState(0);
  const [criteria, setCriteria] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createReviewSchema.safeParse({
      booking_id: bookingId,
      rating_overall: overall || undefined,
      rating_cleanliness: criteria.rating_cleanliness || undefined,
      rating_facilities: criteria.rating_facilities || undefined,
      rating_location: criteria.rating_location || undefined,
      rating_value: criteria.rating_value || undefined,
      comment: comment || undefined,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    create.mutate(parsed.data);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <StarInput value={overall} onChange={setOverall} label="Overall" />
      {errors.rating_overall && <p className="text-xs text-danger">Pick an overall rating</p>}
      {CRITERIA.map((c) => (
        <StarInput
          key={c.key}
          label={c.label}
          value={criteria[c.key] ?? 0}
          onChange={(v) => setCriteria((p) => ({ ...p, [c.key]: v }))}
        />
      ))}
      <Field label="Comment (optional)" htmlFor="review_comment" error={errors.comment}>
        <Textarea
          id="review_comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your stay?"
        />
      </Field>
      <Button type="submit" size="sm" disabled={create.isPending}>
        {create.isPending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  );
}
