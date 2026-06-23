'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { OwnerOnboarding } from '@/components/owner/OwnerOnboarding';

export default function OwnerOnboardingPage() {
  const { user, isLoading } = useRequireAuth('owner');

  if (isLoading || !user) {
    return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <OwnerOnboarding ownerId={user.id} />
    </main>
  );
}
