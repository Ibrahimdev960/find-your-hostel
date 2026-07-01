import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Panel (designer.md §8) — the base surface: cream card, 24px radius, hairline
 * border, and the signature soft "lift" shadow (big blur + big negative spread).
 */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-[24px] border border-border bg-card shadow-[0_22px_70px_-58px_rgba(15,23,42,0.55)]',
        className
      )}
      {...props}
    />
  );
}

/**
 * PanelSection — a Panel with a bordered header (title + description) and a
 * padded body. The standard "form section" / grouped-details block.
 */
export function PanelSection({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Panel className={className}>
      {(title || description || action) && (
        <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm leading-6 text-foreground-muted">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('flex-1 px-5 py-5 sm:px-6', bodyClassName)}>{children}</div>
    </Panel>
  );
}
