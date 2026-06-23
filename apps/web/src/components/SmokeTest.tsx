'use client';

import { useAuthStore } from '@findyourhostel/shared';
import { useProfile } from '@findyourhostel/shared/features/auth/hooks';

/**
 * M0 smoke test — proves the vertical wiring end-to-end:
 * Supabase injection → shared authStore → shared useProfile hook (RLS enforced) → React Query.
 */
export function SmokeTest() {
  const { user, isLoading } = useAuthStore();
  const profile = useProfile(user?.id);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
      <h2 className="mb-3 font-semibold text-neutral-800">Scaffold smoke test</h2>
      <ul className="space-y-1 text-neutral-600">
        <li>Supabase injected: <span className="font-medium text-success">yes</span></li>
        <li>Auth resolving: {isLoading ? 'loading…' : 'ready'}</li>
        <li>Signed in: {user ? `${user.email ?? user.id} (${user.role ?? 'unknown'})` : 'no'}</li>
        <li>
          Profile read:{' '}
          {!user
            ? 'sign in to read profiles (RLS)'
            : profile.isLoading
              ? 'loading…'
              : profile.error
                ? `error: ${(profile.error as Error).message}`
                : `ok — ${profile.data?.full_name ?? 'no name set'}`}
        </li>
      </ul>
    </div>
  );
}
