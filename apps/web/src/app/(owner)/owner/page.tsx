'use client';

import Link from 'next/link';
import {
  useOwnerHostels,
  useSubmitHostel,
  usePublishHostel,
  useUnpublishHostel,
  useDeleteHostel,
} from '@findyourhostel/shared/features/owner';
import { useOwnerProfile } from '@findyourhostel/shared/features/auth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HostelStatusBadge } from '@/components/owner/HostelStatusBadge';

export default function OwnerDashboardPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerProfile = useOwnerProfile(user?.id);
  const hostels = useOwnerHostels(user?.id);
  const submit = useSubmitHostel();
  const publish = usePublishHostel();
  const unpublish = useUnpublishHostel();
  const del = useDeleteHostel(user?.id ?? '');

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const approved = ownerProfile.data?.status === 'approved';

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">My hostels</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/owner/requests">Requests</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/owner/bookings">Bookings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/owner/promotions">Promotions</Link>
          </Button>
          <Button asChild>
            <Link href="/owner/hostels/new">List a new hostel</Link>
          </Button>
        </div>
      </div>

      {!approved && (
        <Card>
          <CardHeader>
            <CardTitle>Verification required to publish</CardTitle>
            <CardDescription>
              You can create and edit listings now, but publishing needs an approved owner
              account.{' '}
              <Link href="/owner/onboarding" className="font-medium text-brand-600 hover:underline">
                Complete verification →
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {hostels.isLoading ? (
        <p className="text-sm text-neutral-500">Loading your hostels…</p>
      ) : hostels.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No hostels yet. Create your first listing to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {hostels.data?.map((h) => (
            <Card key={h.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-neutral-900">{h.name}</span>
                    <HostelStatusBadge status={h.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {[h.city, h.nearest_institution].filter(Boolean).join(' · ') || 'No location set'}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/owner/hostels/${h.id}/edit`}>Edit</Link>
                  </Button>
                  {h.status === 'draft' && (
                    <Button size="sm" onClick={() => submit.mutate(h.id)} disabled={submit.isPending}>
                      Submit
                    </Button>
                  )}
                  {h.status === 'verified' && (
                    <Button size="sm" onClick={() => publish.mutate(h.id)} disabled={publish.isPending}>
                      Publish
                    </Button>
                  )}
                  {h.status === 'unpublished' && (
                    <Button size="sm" onClick={() => publish.mutate(h.id)} disabled={publish.isPending}>
                      Republish
                    </Button>
                  )}
                  {h.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unpublish.mutate(h.id)}
                      disabled={unpublish.isPending}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete “${h.name}”? This cannot be undone.`)) del.mutate(h.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
