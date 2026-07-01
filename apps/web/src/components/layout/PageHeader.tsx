'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * The reusable page header (designer.md §6) — the spine of every screen.
 * Sticky under the navbar (`top-16 z-[25]`), full-bleed via negative margins,
 * title `text-2xl` + one-line subtitle, a `children` toolbar slot, an optional
 * primary action, optional back arrow (history-back so list scroll is
 * restored), and an optional fold-on-scroll title (action → FAB while folded).
 */
export function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  actionIcon: ActionIcon = Plus,
  backHref,
  useBackNavigation,
  backFallbackHref = '/',
  centerTitle,
  collapsibleTitle,
  children,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  backHref?: string;
  useBackNavigation?: boolean;
  backFallbackHref?: string;
  centerTitle?: boolean;
  collapsibleTitle?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Fold-on-scroll with hysteresis (designer.md §6.1): collapse past 120,
  // expand under 24. The dead-band prevents reflow-induced flicker.
  useEffect(() => {
    if (!collapsibleTitle) return;
    const onScroll = () => {
      const y = window.scrollY;
      setCollapsed((prev) => (prev ? y >= 24 : y > 120));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [collapsibleTitle]);

  const hasToolbar = Boolean(children);
  const hasAction = Boolean(actionLabel && (actionHref || onAction));

  function goBack() {
    if (useBackNavigation) {
      router.back();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.push(backFallbackHref);
    }
  }

  const showBack = useBackNavigation || backHref;

  const actionButton = actionLabel ? (
    actionHref ? (
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        <ActionIcon className="h-4 w-4" />
        {actionLabel}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        <ActionIcon className="h-4 w-4" />
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <>
      <div
        className={cn(
          'sticky top-16 z-[25] -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
          hasToolbar
            ? '-mt-6 mb-3 pb-3 pt-5 lg:-mt-8 lg:pt-6'
            : '-mt-6 mb-4 pb-4 pt-6 lg:-mt-8 lg:pt-8'
        )}
      >
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            collapsibleTitle && collapsed ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'
          )}
        >
          <div className={cn('flex items-start gap-3', centerTitle && 'justify-center text-center')}>
            {showBack && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                className="mt-0.5 flex h-9 w-9 coarse:h-11 coarse:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:bg-background-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>}
            </div>
            {actionButton && <div className="shrink-0">{actionButton}</div>}
          </div>
        </div>

        {hasToolbar && <div className={cn(collapsibleTitle && collapsed ? 'mt-0' : 'mt-3')}>{children}</div>}
      </div>

      {/* FAB: rendered OUTSIDE the blurred container (a backdrop-filter ancestor
          traps position:fixed). Only when a collapsible header has an action. */}
      {collapsibleTitle && hasAction && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              aria-label={actionLabel}
              className={cn(
                'fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5)] transition-all duration-200',
                collapsed ? 'scale-100 opacity-100' : 'pointer-events-none scale-0 opacity-0'
              )}
            >
              <ActionIcon className="h-6 w-6" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              aria-label={actionLabel}
              className={cn(
                'fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5)] transition-all duration-200',
                collapsed ? 'scale-100 opacity-100' : 'pointer-events-none scale-0 opacity-0'
              )}
            >
              <ActionIcon className="h-6 w-6" />
            </button>
          )}
        </>
      )}
    </>
  );
}
