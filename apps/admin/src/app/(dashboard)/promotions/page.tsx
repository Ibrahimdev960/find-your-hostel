'use client';

import { usePendingPromotions, useApprovePromotion, useRejectPromotion } from '@findyourhostel/shared/hooks';
import { PROMOTION_PLAN_LABEL, PAYMENT_METHOD_LABEL, formatDate } from '@findyourhostel/shared';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

/** Admin · Promotions approval queue (M11/M13). Approving starts the featured timer. */
export default function PromotionsPage() {
  const pending = usePendingPromotions();
  const approve = useApprovePromotion();
  const reject = useRejectPromotion();

  const viewProof = async (path: string) => {
    const supabase = createClient();
    const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Promotions — approval queue</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Approve to start the featured window, or reject. Featured listings rank higher in search.
        </p>
      </div>

      {pending.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : pending.data?.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Nothing awaiting review. 🎉
        </div>
      ) : (
        <div className="space-y-3">
          {pending.data?.map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{PROMOTION_PLAN_LABEL[p.plan]}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {PAYMENT_METHOD_LABEL[p.payment_method]} · submitted {formatDate(p.created_at)}
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-400">hostel {p.hostel_id}</p>
                {p.proof_url && (
                  <button
                    type="button"
                    onClick={() => viewProof(p.proof_url as string)}
                    className="mt-1 text-xs text-brand-600 hover:underline"
                  >
                    View payment proof
                  </button>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button size="sm" onClick={() => approve.mutate(p.id)} disabled={approve.isPending || reject.isPending}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reject.mutate({ id: p.id, reason: prompt('Reason (optional)') ?? undefined })}
                  disabled={approve.isPending || reject.isPending}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
