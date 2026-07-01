'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Read-only star rating display. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('h-4 w-4', n <= Math.round(value) ? 'fill-warning text-warning' : 'text-border')}
        />
      ))}
    </span>
  );
}

/** Interactive star picker (1–5). */
export function StarInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm text-foreground-secondary">{label}</span>}
      <span className="inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange(n)}
          >
            <Star
              className={cn('h-5 w-5', n <= value ? 'fill-warning text-warning' : 'text-border hover:text-warning')}
            />
          </button>
        ))}
      </span>
    </div>
  );
}
