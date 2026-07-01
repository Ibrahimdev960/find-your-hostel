'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, ShieldAlert } from 'lucide-react';
import {
  useOwnerHostels,
  useSubmitHostel,
  usePublishHostel,
  useUnpublishHostel,
  useDeleteHostel,
} from '@findyourhostel/shared/features/owner';
import { useOwnerProfile } from '@findyourhostel/shared/features/auth';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/dialog';
import { HostelStatusBadge } from '@/components/owner/HostelStatusBadge';

export default function OwnerDashboardPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerProfile = useOwnerProfile(user?.id);
  const hostels = useOwnerHostels(user?.id);
  const submit = useSubmitHostel();
  const publish = usePublishHostel();
  const unpublish = useUnpublishHostel();
  const del = useDeleteHostel(user?.id ?? '');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const approved = ownerProfile.data?.status === 'approved';
  const data = hostels.data ?? [];
  const published = data.filter((h) => h.status === 'published').length;
  const drafts = data.filter((h) => h.status === 'draft').length;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Dashboard"
        subtitle="Manage your listings, bookings, and promotions."
        actionLabel="List your hostel"
        actionHref="/owner/hostels/new"
        collapsibleTitle
      />

      {!approved && (
        <Panel className="flex-row items-start gap-3 border-warning/30 bg-warning/5 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-foreground">You&apos;re almost there</p>
            <p className="mt-1 text-sm text-foreground-muted">
              You can create and edit listings now. Finish verification to let students see your
              hostel.{' '}
              <Link href="/owner/onboarding" className="font-semibold text-primary hover:underline">
                Finish verification →
              </Link>
            </p>
          </div>
        </Panel>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Listings" value={data.length} icon={Building2} />
        <StatCard label="Published" value={published} />
        <StatCard label="Drafts" value={drafts} />
      </section>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">My hostels</h2>
        {isLoading || !user || hostels.isLoading ? (
          <SkeletonList count={3} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No hostels yet"
            description="Create your first listing to start receiving bookings."
            action={
              <Button asChild>
                <Link href="/owner/hostels/new">List your hostel</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {data.map((h) => (
              <div
                key={h.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground">{h.name}</span>
                    <HostelStatusBadge status={h.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-foreground-muted">
                    {[h.city, h.nearest_institution].filter(Boolean).join(' · ') || 'No location set'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:shrink-0 sm:justify-end">
                  <Button asChild variant="secondary" size="sm">
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
                      variant="secondary"
                      size="sm"
                      onClick={() => unpublish.mutate(h.id)}
                      disabled={unpublish.isPending}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    variant="destructiveGhost"
                    size="sm"
                    onClick={() => setDeleteTarget({ id: h.id, name: h.name })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={deleteTarget ? `Delete “${deleteTarget.name}”?` : 'Delete listing?'}
        description="This permanently removes the listing. This cannot be undone."
        confirmLabel="Delete listing"
        loading={del.isPending}
        onConfirm={() =>
          deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  );
}
