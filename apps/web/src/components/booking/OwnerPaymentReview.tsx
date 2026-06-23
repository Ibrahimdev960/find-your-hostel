'use client';

import { useBookingPayments, useConfirmPayment, useRejectPayment } from '@findyourhostel/shared/hooks';
import { formatCurrency, PAYMENT_METHOD_LABEL, PAYMENT_STAGE_LABEL } from '@findyourhostel/shared';
import { getSignedUrl } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { PaymentStatusBadge } from '@/components/booking/PaymentStatusBadge';

/** Owner-facing payment list with confirm/reject + proof viewing for one booking. */
export function OwnerPaymentReview({ bookingId }: { bookingId: string }) {
  const payments = useBookingPayments(bookingId);
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();

  if (payments.isLoading) return <p className="text-xs text-neutral-400">Loading payments…</p>;
  if (!payments.data?.length) return null;

  const viewProof = async (path: string) => {
    const url = await getSignedUrl('payment-proofs', path);
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-2 border-t border-neutral-200 pt-3 text-sm">
      {payments.data.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-neutral-700">
              {PAYMENT_STAGE_LABEL[p.stage]} · {formatCurrency(p.amount)} ·{' '}
              {PAYMENT_METHOD_LABEL[p.method]}
            </span>
            <PaymentStatusBadge status={p.status} />
            {p.proof_url && (
              <button
                type="button"
                onClick={() => viewProof(p.proof_url as string)}
                className="text-xs text-brand-600 hover:underline"
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
                onClick={() => {
                  const reason = prompt('Reason for rejection (optional)') ?? undefined;
                  reject.mutate({ id: p.id, reason });
                }}
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
