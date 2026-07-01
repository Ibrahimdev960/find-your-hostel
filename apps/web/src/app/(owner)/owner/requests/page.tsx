'use client';

import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { useOpenRequests, useWithdrawOffer } from '@findyourhostel/shared/features/owner';
import { useOwnerHostels } from '@findyourhostel/shared/features/owner';
import { useOwnerProfile } from '@findyourhostel/shared/features/auth';
import { formatCurrency, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { OfferStatusBadge } from '@/components/request/RequestStatusBadge';
import { SubmitOfferForm } from '@/components/request/SubmitOfferForm';

export default function OwnerRequestsPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerId = user?.id ?? '';
  const ownerProfile = useOwnerProfile(user?.id);
  const requests = useOpenRequests();
  const hostels = useOwnerHostels(user?.id);
  const withdraw = useWithdrawOffer(ownerId);

  const approved = ownerProfile.data?.status === 'approved';

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Open requests"
        subtitle="Browse student requests and send an offer from one of your hostels."
      />

      {!approved && (
        <Panel className="border-warning/30 bg-warning/5 p-4 text-sm text-foreground-secondary">
          Your owner account must be approved before you can send offers.{' '}
          <Link href="/owner/onboarding" className="font-semibold text-primary hover:underline">
            Complete verification →
          </Link>
        </Panel>
      )}

      {isLoading || !user || requests.isLoading ? (
        <SkeletonList count={3} />
      ) : requests.data?.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No open requests right now"
          description="When students post requests that match, they'll show up here."
        />
      ) : (
        <div className="space-y-3">
          {requests.data?.map((r) => {
            const myOffer = r.offers?.find((o) => o.owner_id === ownerId);
            return (
              <Panel key={r.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {[r.city, r.nearest_institution].filter(Boolean).join(' · ') || 'Anywhere'}
                    </h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any seat'} ·{' '}
                      {r.budget_max != null ? `up to ${formatCurrency(r.budget_max)}` : 'Any budget'}{' '}
                      · {r.duration_months} mo
                      {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
                    </p>
                  </div>
                  {myOffer && <OfferStatusBadge status={myOffer.status} viewer="owner" />}
                </div>

                {r.notes && <p className="mt-3 text-sm text-foreground-secondary">{r.notes}</p>}

                {myOffer ? (
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-foreground-muted">You&apos;ve sent an offer on this request.</span>
                    {myOffer.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructiveGhost"
                        onClick={() => withdraw.mutate(myOffer.id)}
                        disabled={withdraw.isPending}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                ) : approved ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <SubmitOfferForm requestId={r.id} ownerId={ownerId} hostels={hostels.data ?? []} />
                  </div>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
