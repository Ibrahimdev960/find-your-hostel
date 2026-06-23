'use client';

import { type ReactNode } from 'react';
import { useAuthStore } from '@findyourhostel/shared';

/**
 * Client-side admin gate. Defence-in-depth only — the real enforcement is RLS +
 * the is_admin() helper in Postgres. Server components should also check the role.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="p-8 text-sm text-neutral-500">Checking access…</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-sm text-neutral-600">
        You must <a className="text-brand-600 underline" href="/login">sign in</a> to access the
        admin panel.
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-8 text-sm text-danger">Access denied — admin role required.</div>
    );
  }

  return <>{children}</>;
}
