'use client';

import { useState } from 'react';
import { useHostelReviews, useRespondToReview } from '@findyourhostel/shared/hooks';
import { useAuthStore, formatDate } from '@findyourhostel/shared';
import type { Review } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stars } from '@/components/review/Stars';
import { ReportButton } from '@/components/review/ReportButton';

export function HostelReviews({ hostelId, ownerId }: { hostelId: string; ownerId: string }) {
  const reviews = useHostelReviews(hostelId);
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === ownerId;

  if (reviews.isLoading) return <p className="text-sm text-foreground-muted">Loading reviews…</p>;
  if (!reviews.data?.length) {
    return <p className="text-sm text-foreground-muted">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.data.map((r) => (
        <ReviewItem key={r.id} review={r} canRespond={isOwner} />
      ))}
    </div>
  );
}

function ReviewItem({ review, canRespond }: { review: Review; canRespond: boolean }) {
  const respond = useRespondToReview();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{review.reviewer_name ?? 'Student'}</span>
        <span className="text-xs text-foreground-muted">{formatDate(review.created_at)}</span>
      </div>
      <Stars value={review.rating_overall} className="mt-1" />
      {review.comment && <p className="mt-2 text-sm text-foreground-secondary">{review.comment}</p>}

      {review.owner_response && (
        <div className="mt-3 rounded-md bg-background-secondary p-3 text-sm">
          <p className="font-medium text-foreground-secondary">Owner response</p>
          <p className="mt-0.5 text-foreground-muted">{review.owner_response}</p>
        </div>
      )}

      <div className="mt-2 flex items-center gap-4">
        <ReportButton targetType="review" targetId={review.id} />
        {canRespond && !review.owner_response && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-primary hover:underline"
          >
            Respond
          </button>
        )}
      </div>

      {canRespond && open && !review.owner_response && (
        <div className="mt-2 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a response…"
            className="min-h-16 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={respond.isPending || !text.trim()}
              onClick={() =>
                respond.mutate({ id: review.id, response: text.trim() }, { onSuccess: () => setOpen(false) })
              }
            >
              Post response
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
