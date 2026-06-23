'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useRequest,
  useRequestOffers,
  useCancelRequest,
  useCloneRequest,
  useRespondToOffer,
} from '@findyourhostel/shared/features/student';
import { formatCurrency, formatRent, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestStatusBadge, OfferStatusBadge } from '@/components/request/RequestStatusBadge';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading } = useRequireAuth('student');
  const studentId = user?.id ?? '';

  const request = useRequest(id);
  const offers = useRequestOffers(id);
  const cancel = useCancelRequest(studentId);
  const clone = useCloneRequest(studentId);
  const { accept, reject } = useRespondToOffer(studentId);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (request.isLoading) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (!request.data) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500">
        Request not found.{' '}
        <Link href="/requests" className="text-brand-600 hover:underline">
          My requests
        </Link>
      </div>
    );
  }

  const r = request.data;
  const isOpen = r.status === 'open';
  const busy = accept.isPending || reject.isPending;

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <Link href="/requests" className="text-sm text-brand-600 hover:underline">
        ← My requests
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {[r.city, r.nearest_institution].filter(Boolean).join(' · ') || 'Anywhere'}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any seat'} ·{' '}
            {r.budget_max != null ? `up to ${formatCurrency(r.budget_max)}` : 'Any budget'} ·{' '}
            {r.duration_months} mo
            {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
          </p>
        </div>
        <RequestStatusBadge status={r.status} />
      </div>

      {r.notes && <p className="text-sm text-neutral-700">{r.notes}</p>}

      <div className="flex flex-wrap gap-2">
        {isOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Cancel this request?')) cancel.mutate(r.id);
            }}
            disabled={cancel.isPending}
          >
            Cancel request
          </Button>
        )}
        {(r.status === 'cancelled' || r.status === 'expired') && (
          <Button
            size="sm"
            onClick={() =>
              clone.mutate(r.id, { onSuccess: (n) => router.push(`/requests/${n.id}`) })
            }
            disabled={clone.isPending}
          >
            Start a new request
          </Button>
        )}
      </div>

      {/* Offers */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">
          Offers {offers.data?.length ? `(${offers.data.length})` : ''}
        </h2>
        {offers.isLoading ? (
          <p className="text-sm text-neutral-500">Loading offers…</p>
        ) : offers.data?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-neutral-500">
              No offers yet. Verified owners can respond to your open request.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {offers.data?.map((o) => (
              <Card key={o.id}>
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-base">{o.hostel?.name ?? 'Hostel'}</CardTitle>
                  <OfferStatusBadge status={o.status} />
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-neutral-500">
                    {[o.hostel?.city, o.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
                      'Location n/a'}
                  </p>
                  <p className="font-semibold text-neutral-900">{formatRent(o.monthly_rent)}</p>
                  {o.message && <p className="text-neutral-700">{o.message}</p>}
                  {isOpen && o.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => accept.mutate(o.id)} disabled={busy}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reject.mutate(o.id)}
                        disabled={busy}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
