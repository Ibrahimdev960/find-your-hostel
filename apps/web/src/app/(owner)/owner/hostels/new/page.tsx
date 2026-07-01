'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { HostelWizard } from '@/components/owner/HostelWizard';

export default function NewHostelPage() {
  const { user, isLoading } = useRequireAuth('owner');
  if (isLoading || !user) return <div className="p-10 text-sm text-foreground-muted">Loading…</div>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <HostelWizard ownerId={user.id} />
    </main>
  );
}
