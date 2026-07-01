'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@findyourhostel/shared';
import { useUnreadCount } from '@findyourhostel/shared/hooks';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { Navbar } from './Navbar';
import type { NavItem } from './navConfig';

const COLLAPSE_KEY = 'fyh-sidebar-collapsed';

/**
 * The global app frame (designer.md §5): fixed desktop sidebar + off-canvas
 * mobile drawer + sticky navbar + a max-width content column whose left padding
 * animates with the sidebar width. Collapse state persists in localStorage.
 */
export function AppShell({
  nav,
  workspaceLabel,
  children,
}: {
  nav: NavItem[];
  workspaceLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const unread = useUnreadCount(user?.id);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapse preference.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const badges: Record<string, number> = { notifications: unread.data ?? 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop fixed sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]'
        )}
      >
        <Sidebar
          nav={nav}
          workspaceLabel={workspaceLabel}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          badges={badges}
        />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={nav}
        workspaceLabel={workspaceLabel}
        badges={badges}
      />

      {/* Main column */}
      <div
        className={cn(
          'transition-[padding] duration-200',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]'
        )}
      >
        <Navbar workspaceLabel={workspaceLabel} onMenuClick={() => setMobileOpen(true)} />
        {/* min-w-0 stops wide children (tables/maps) from forcing horizontal page scroll. */}
        <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
