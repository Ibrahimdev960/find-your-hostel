'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import type { NavItem } from './navConfig';

/**
 * Off-canvas drawer for < lg (designer.md §5.1): backdrop z-40, panel z-50.
 * Reuses the same Sidebar (never collapsed inside the drawer).
 */
export function MobileSidebar({
  open,
  onClose,
  nav,
  workspaceLabel,
  badges,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  workspaceLabel: string;
  badges?: Record<string, number>;
}) {
  // Close on route change is handled by the shell; lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <div
        className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-y-0 left-0 z-50 w-[248px]">
        <div className="relative h-full">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-4 z-10 flex h-8 w-8 coarse:h-11 coarse:w-11 items-center justify-center rounded-full border border-border bg-card text-foreground-muted"
          >
            <X className="h-4 w-4" />
          </button>
          <Sidebar
            nav={nav}
            workspaceLabel={workspaceLabel}
            collapsed={false}
            onToggleCollapsed={() => {}}
            badges={badges}
          />
        </div>
      </div>
    </div>
  );
}
