'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Metric card (page-templates.md §Dashboard) — eyebrow label + big value +
 * optional icon. Clickable cards route into a filtered list.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  hint?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground-muted">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background-secondary text-foreground-muted">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
    </>
  );

  const base = 'rounded-2xl border border-border bg-card p-5 transition';

  if (href) {
    return (
      <Link href={href} className={cn(base, 'hover:-translate-y-0.5 hover:shadow-md', className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}
