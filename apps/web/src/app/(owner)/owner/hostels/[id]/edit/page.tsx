'use client';

import { use } from 'react';
import { useHostel } from '@findyourhostel/shared/features/owner';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { HostelWizard } from '@/components/owner/HostelWizard';

export default function EditHostelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading } = useRequireAuth('owner');
  const hostel = useHostel(id);

  if (isLoading || !user || hostel.isLoading) {
    return <div className="p-10 text-sm text-foreground-muted">Loading…</div>;
  }
  if (hostel.error || !hostel.data) {
    return <div className="p-10 text-sm text-error">Hostel not found.</div>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <HostelWizard ownerId={user.id} hostel={hostel.data} />
    </main>
  );
}
