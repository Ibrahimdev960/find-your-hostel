'use client';

import { useAuthStore } from '@findyourhostel/shared';
import { AppShell } from '@/components/layout/AppShell';
import { studentNav, ownerNav } from '@/components/layout/navConfig';

/**
 * Shared authed surfaces (messages, notifications, community, profile) render
 * inside the acting role's shell (plan §5.1) — owners get the owner nav,
 * everyone else the student nav.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === 'owner';
  return (
    <AppShell
      nav={isOwner ? ownerNav : studentNav}
      workspaceLabel={isOwner ? 'Owner' : 'Student'}
    >
      {children}
    </AppShell>
  );
}
