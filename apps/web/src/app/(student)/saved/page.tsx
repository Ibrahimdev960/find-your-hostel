'use client';

import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { useSavedHostels, useToggleSaved } from '@findyourhostel/shared/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';

export default function SavedHostelsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const saved = useSavedHostels(user?.id);
  const toggle = useToggleSaved(user?.id ?? '');

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Saved hostels" subtitle="Your private shortlist to compare later." />

      {isLoading || !user || saved.isLoading ? (
        <SkeletonList count={3} />
      ) : saved.data?.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved hostels yet"
          description="Tap the heart on any hostel to add it to your shortlist."
          action={
            <Button asChild>
              <Link href="/search">Search hostels</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {saved.data?.map((s) => (
            <div
              key={s.hostel_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <Link href={`/hostels/${s.hostel_id}`} className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{s.hostel?.name ?? 'Hostel'}</p>
                <p className="mt-0.5 truncate text-sm text-foreground-muted">
                  {[s.hostel?.city, s.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
                    'Location n/a'}
                </p>
              </Link>
              <button
                type="button"
                aria-label="Remove from saved"
                onClick={() => toggle.mutate({ hostelId: s.hostel_id, saved: false })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-muted transition hover:bg-background-secondary hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
