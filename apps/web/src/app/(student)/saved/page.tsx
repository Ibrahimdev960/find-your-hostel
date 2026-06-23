'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useSavedHostels, useToggleSaved } from '@findyourhostel/shared/hooks';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Card, CardContent } from '@/components/ui/card';

export default function SavedHostelsPage() {
  const { user, isLoading } = useRequireAuth('student');
  const saved = useSavedHostels(user?.id);
  const toggle = useToggleSaved(user?.id ?? '');

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Saved hostels</h1>

      {saved.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : saved.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No saved hostels yet.{' '}
            <Link href="/search" className="text-brand-600 hover:underline">
              Find some to shortlist
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {saved.data?.map((s) => (
            <Card key={s.hostel_id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <Link href={`/hostels/${s.hostel_id}`} className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">{s.hostel?.name ?? 'Hostel'}</p>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {[s.hostel?.city, s.hostel?.nearest_institution].filter(Boolean).join(' · ') ||
                      'Location n/a'}
                  </p>
                </Link>
                <button
                  type="button"
                  aria-label="Remove from saved"
                  onClick={() => toggle.mutate({ hostelId: s.hostel_id, saved: false })}
                  className="flex-shrink-0 text-neutral-400 hover:text-danger"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
