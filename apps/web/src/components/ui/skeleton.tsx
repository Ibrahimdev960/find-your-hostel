import * as React from 'react';
import { cn } from '@/lib/cn';

/** Loading placeholder — prefer over spinners (designer.md §12). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-background-secondary', className)}
      {...props}
    />
  );
}

/** A stack of card-shaped skeletons for list/detail loading states. */
export function SkeletonList({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
