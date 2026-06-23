'use client';

import { usePendingHostels, useVerifyHostel, useRejectHostel } from '@findyourhostel/shared/hooks';
import { Button } from '@/components/ui/button';

/** Admin · Listings verification — approve/reject hostels submitted for review (M2/M13). */
export default function ListingsPage() {
  const pending = usePendingHostels();
  const verify = useVerifyHostel();
  const reject = useRejectHostel();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Listings — verification queue</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Review hostels submitted by owners. Approving makes them publishable.
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
          {pending.data?.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-neutral-900">{h.name}</p>
                <p className="mt-0.5 truncate text-sm text-neutral-500">
                  {[h.city, h.nearest_institution].filter(Boolean).join(' · ') || 'No location'} ·{' '}
                  {h.hostel_type}
                </p>
                {h.submitted_at && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Submitted {new Date(h.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Button size="sm" onClick={() => verify.mutate(h.id)} disabled={verify.isPending}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt('Reason for rejection?');
                    if (reason) reject.mutate({ id: h.id, reason });
                  }}
                  disabled={reject.isPending}
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
