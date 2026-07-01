'use client';

import { useState } from 'react';
import { useBookingPayments, useConfirmPayment, useRejectPayment } from '@findyourhostel/shared/hooks';
import { formatCurrency, PAYMENT_METHOD_LABEL, PAYMENT_STAGE_PLAIN } from '@findyourhostel/shared';
import { getSignedUrl } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { ReasonDialog } from '@/components/ui/reason-dialog';
import { PaymentStatusBadge } from '@/components/booking/PaymentStatusBadge';

/** Owner-facing payment list with confirm/reject + proof viewing for one booking. */
export function OwnerPaymentReview({ bookingId }: { bookingId: string }) {
  const payments = useBookingPayments(bookingId);
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();
  const [rejectId, setRejectId] = useState<string | null>(null);

  if (payments.isLoading) return <p className="text-xs text-foreground-muted">Loading payments…</p>;
  if (!payments.data?.length) return null;

  const viewProof = async (path: string) => {
    const url = await getSignedUrl('payment-proofs', path);
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-2 border-t border-border pt-3 text-sm">
      <ReasonDialog
        open={rejectId != null}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject this payment?"
        description="The student is asked to send it again. Tell them what to fix so they can resend."
        label="Reason (optional)"
        placeholder="e.g. Screenshot is unclear — please resend"
        confirmLabel="Reject payment"
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejectId && reject.mutate({ id: rejectId, reason }, { onSuccess: () => setRejectId(null) })
        }
      />
      {payments.data.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-foreground-secondary">
              {PAYMENT_STAGE_PLAIN[p.stage]} · {formatCurrency(p.amount)} ·{' '}
              {PAYMENT_METHOD_LABEL[p.method]}
            </span>
            <PaymentStatusBadge status={p.status} viewer="owner" />
            {p.proof_url && (
              <button
                type="button"
                onClick={() => viewProof(p.proof_url as string)}
                className="text-xs text-primary hover:underline"
              >
                View proof
              </button>
            )}
          </div>
          {p.status === 'submitted' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => confirm.mutate(p.id)}
                disabled={confirm.isPending || reject.isPending}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRejectId(p.id)}
                disabled={confirm.isPending || reject.isPending}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
