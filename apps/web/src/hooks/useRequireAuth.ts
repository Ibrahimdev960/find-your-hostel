'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@findyourhostel/shared';

/**
 * Client-side auth gate. Redirects to /login once the session has resolved and
 * there is no user. Returns the current auth snapshot for convenience.
 * (Defence-in-depth only — RLS is the real enforcement.)
 */
export function useRequireAuth(role?: 'student' | 'owner' | 'admin') {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (role && user.role !== role) {
      router.replace('/');
    }
  }, [user, isLoading, role, router]);

  return { user, isLoading };
}
