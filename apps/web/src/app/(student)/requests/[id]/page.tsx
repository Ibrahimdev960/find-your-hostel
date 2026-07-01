'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import {
  useRequest,
  useRequestOffers,
  useCancelRequest,
  useCloneRequest,
  useRespondToOffer,
} from '@findyourhostel/shared/features/student';
import { formatCurrency, formatRent, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/dialog';
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

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [acceptId, setAcceptId] = useState<string | null>(null);

  if (isLoading || !user || request.isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Request" useBackNavigation backFallbackHref="/requests" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!request.data) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Request not found" useBackNavigation backFallbackHref="/requests" />
        <EmptyState icon={Inbox} title="Request not found" description="It may have been removed." />
      </div>
    );
  }

  const r = request.data;
  const isOpen = r.status === 'open';
  const busy = accept.isPending || reject.isPending;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={[r.city, r.nearest_institution].filter(Boolean).join(' · ') || 'Anywhere'}
        useBackNavigation
        backFallbackHref="/requests"
        actionLabel={r.status === 'cancelled' || r.status === 'expired' ? 'Start a new request' : undefined}
        onAction={
          r.status === 'cancelled' || r.status === 'expired'
            ? () => clone.mutate(r.id, { onSuccess: (n) => router.push(`/requests/${n.id}`) })
            : undefined
        }
      />

      <Panel className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-foreground-muted">
            {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any room'} ·{' '}
            {r.budget_max != null ? `up to ${formatCurrency(r.budget_max)}` : 'Any budget'} ·{' '}
            {r.duration_months} mo
            {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
          </p>
          <RequestStatusBadge status={r.status} />
        </div>
        {r.notes && <p className="mt-3 text-sm text-foreground-secondary">{r.notes}</p>}
        {isOpen && (
          <div className="mt-4">
            <Button variant="destructiveGhost" size="sm" onClick={() => setConfirmCancel(true)} disabled={cancel.isPending}>
              Cancel request
            </Button>
          </div>
        )}
      </Panel>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Offers you received {offers.data?.length ? `(${offers.data.length})` : ''}
        </h2>
        {offers.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : offers.data?.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No offers yet"
            description="Approved owners can respond to your open request with an offer. This can take a little time — we'll notify you when one arrives."
          />
        ) : (
          <div className="space-y-3">
            {offers.data?.map((o) => (
              <Panel key={o.id} className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{o.hostel?.name ?? 'Hostel'}</h3>
                  <OfferStatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-foreground-muted">
                  {[o.hostel?.city, o.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
                    'Location n/a'}
                </p>
                <p className="mt-2 font-semibold text-foreground">{formatRent(o.monthly_rent)}</p>
                {o.message && <p className="mt-1 text-sm text-foreground-secondary">{o.message}</p>}
                {isOpen && o.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setAcceptId(o.id)} disabled={busy}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => reject.mutate(o.id)} disabled={busy}>
                      Decline
                    </Button>
                  </div>
                )}
              </Panel>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this request?"
        description="Owners will no longer be able to send offers. You can start a new request later."
        confirmLabel="Cancel request"
        cancelLabel="Keep it"
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate(r.id, { onSuccess: () => setConfirmCancel(false) })}
      />
      <ConfirmDialog
        open={acceptId != null}
        onOpenChange={(o) => !o && setAcceptId(null)}
        title="Accept this offer?"
        description="Accepting books your request and automatically declines all other offers."
        confirmLabel="Accept offer"
        destructive={false}
        loading={accept.isPending}
        onConfirm={() => acceptId && accept.mutate(acceptId, { onSuccess: () => setAcceptId(null) })}
      />
    </div>
  );
}
