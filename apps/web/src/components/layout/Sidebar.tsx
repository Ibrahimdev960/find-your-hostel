'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, Building } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { useLogout } from '@findyourhostel/shared/features/auth';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/cn';
import type { NavItem } from './navConfig';

/** Is `href` the active route? Exact match for '/', prefix match otherwise. */
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  nav,
  workspaceLabel,
  collapsed,
  onToggleCollapsed,
  badges = {},
}: {
  nav: NavItem[];
  workspaceLabel: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-border bg-background-secondary/50 transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[248px]'
      )}
    >
      {/* Collapse toggle straddling the right edge */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-foreground-muted shadow-sm transition hover:text-foreground lg:flex"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Logo + workspace */}
      <div className="flex h-16 items-center gap-2.5 px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">Find Your Hostel</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {workspaceLabel}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-2">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border border-border bg-card text-foreground'
                  : 'text-foreground-muted hover:bg-card hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
            >
              <span
                className={cn(
                  'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground-muted group-hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {collapsed && badge != null && badge > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background-secondary" />
                )}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && badge != null && badge > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.email ?? 'Account'}
              </p>
              <p className="truncate text-xs capitalize text-foreground-muted">{user?.role ?? ''}</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 coarse:h-11 coarse:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:bg-background-secondary"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/login') })}
            className="flex h-9 w-9 coarse:h-11 coarse:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:border-error/40 hover:text-error"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
