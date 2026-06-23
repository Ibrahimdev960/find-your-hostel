'use client';

import Link from 'next/link';
import { useOpenRequests, useWithdrawOffer } from '@findyourhostel/shared/features/owner';
import { useOwnerHostels } from '@findyourhostel/shared/features/owner';
import { useOwnerProfile } from '@findyourhostel/shared/features/auth';
import { formatCurrency, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferStatusBadge } from '@/components/request/RequestStatusBadge';
import { SubmitOfferForm } from '@/components/request/SubmitOfferForm';

export default function OwnerRequestsPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerId = user?.id ?? '';
  const ownerProfile = useOwnerProfile(user?.id);
  const requests = useOpenRequests();
  const hostels = useOwnerHostels(user?.id);
  const withdraw = useWithdrawOffer(ownerId);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const approved = ownerProfile.data?.status === 'approved';

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Open requests</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/owner">My hostels</Link>
        </Button>
      </div>

      {!approved && (
        <Card>
          <CardContent className="py-4 text-sm text-neutral-600">
            Your owner account must be approved before you can send offers.{' '}
            <Link href="/owner/onboarding" className="font-medium text-brand-600 hover:underline">
              Complete verification →
            </Link>
          </CardContent>
        </Card>
      )}

      {requests.isLoading ? (
        <p className="text-sm text-neutral-500">Loading requests…</p>
      ) : requests.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No open requests right now. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.data?.map((r) => {
            const myOffer = r.offers?.find((o) => o.owner_id === ownerId);
            return (
              <Card key={r.id}>
                <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {[r.city, r.nearest_institution].filter(Boolean).join(' · ') || 'Anywhere'}
                    </CardTitle>
                    <p className="mt-1 text-sm text-neutral-500">
                      {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any seat'} ·{' '}
                      {r.budget_max != null ? `up to ${formatCurrency(r.budget_max)}` : 'Any budget'}{' '}
                      · {r.duration_months} mo
                      {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
                    </p>
                  </div>
                  {myOffer && <OfferStatusBadge status={myOffer.status} />}
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.notes && <p className="text-sm text-neutral-700">{r.notes}</p>}

                  {myOffer ? (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
                      <span className="text-neutral-500">You’ve sent an offer on this request.</span>
                      {myOffer.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => withdraw.mutate(myOffer.id)}
                          disabled={withdraw.isPending}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  ) : approved ? (
                    <SubmitOfferForm requestId={r.id} ownerId={ownerId} hostels={hostels.data ?? []} />
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
