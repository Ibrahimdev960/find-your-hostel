'use client';

import { Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

/**
 * Sticky top navbar (designer.md §5). Holds the mobile menu button, the
 * workspace identity, and the notification bell. Page titles live in the
 * reusable PageHeader below it, not here.
 */
export function Navbar({
  workspaceLabel,
  onMenuClick,
}: {
  workspaceLabel: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 coarse:h-11 coarse:w-11 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:bg-background-secondary lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>
      <p className="hidden min-w-0 truncate text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted xs:block">
        {workspaceLabel}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
