'use client';

import Link from 'next/link';
import { useStudentRequests } from '@findyourhostel/shared/features/student';
import { formatCurrency, formatDate, SEAT_TYPE_LABEL } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RequestStatusBadge } from '@/components/request/RequestStatusBadge';

function budgetLabel(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${formatCurrency(min)}–${formatCurrency(max)}`;
  if (max != null) return `up to ${formatCurrency(max)}`;
  if (min != null) return `from ${formatCurrency(min)}`;
  return 'Any budget';
}

export default function MyRequestsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const requests = useStudentRequests(user?.id);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">My requests</h1>
        <Button asChild>
          <Link href="/requests/new">Post a request</Link>
        </Button>
      </div>

      {requests.isLoading ? (
        <p className="text-sm text-neutral-500">Loading your requests…</p>
      ) : requests.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No requests yet. Post one and let owners send you offers.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.data?.map((r) => {
            const offerCount = r.offers?.[0]?.count ?? 0;
            return (
              <Link key={r.id} href={`/requests/${r.id}`} className="block">
                <Card className="transition-colors hover:border-brand-300">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-neutral-900">
                          {[r.city, r.nearest_institution].filter(Boolean).join(' · ') ||
                            'Anywhere'}
                        </span>
                        <RequestStatusBadge status={r.status} />
                      </div>
                      <p className="mt-0.5 truncate text-sm text-neutral-500">
                        {r.seat_type ? SEAT_TYPE_LABEL[r.seat_type] : 'Any seat'} ·{' '}
                        {budgetLabel(r.budget_min, r.budget_max)}
                        {r.move_in_date ? ` · move-in ${formatDate(r.move_in_date)}` : ''}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right text-sm">
                      <p className="font-semibold text-neutral-900">{offerCount}</p>
                      <p className="text-xs text-neutral-500">offer{offerCount === 1 ? '' : 's'}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
