import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { StatusTone } from '@findyourhostel/shared';
import { cn } from '@/lib/cn';

/**
 * Tinted pill (designer.md §8). One primitive for every status badge across the
 * app — feed it a `tone` from the shared `*StatusTone` helpers so Booking /
 * Payment / Hostel / Request / Offer / Promotion badges all read identically.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      tone: {
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-error/10 text-error',
        neutral: 'bg-background-secondary text-foreground-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Status pill — a Badge whose tone comes from the shared StatusTone union. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge tone={tone} className={className}>
      {children}
    </Badge>
  );
}

export { badgeVariants };
