'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ownerNav } from '@/components/layout/navConfig';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={ownerNav} workspaceLabel="Owner">
      {children}
    </AppShell>
  );
}
