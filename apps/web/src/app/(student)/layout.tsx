'use client';

import { AppShell } from '@/components/layout/AppShell';
import { studentNav } from '@/components/layout/navConfig';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={studentNav} workspaceLabel="Student">
      {children}
    </AppShell>
  );
}
