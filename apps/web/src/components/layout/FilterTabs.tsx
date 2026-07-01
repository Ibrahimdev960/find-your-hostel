'use client';

import { cn } from '@/lib/cn';

export interface FilterTab<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Segmented pill control (designer.md §7) — a pill track holding pill segments.
 * Active segment is a raised card (`bg-card` + soft shadow + primary text);
 * counts ride inside as soft pill badges. Pass `className="min-w-0"` so a search
 * box can share the row and the tabs scroll instead of pushing it out.
 */
export function FilterTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('w-full overflow-x-auto pb-1', className)} role="tablist">
      <div className="inline-flex min-w-max gap-1 rounded-2xl border border-border bg-background-secondary/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200',
                active
                  ? 'bg-card text-primary shadow-[0_1px_8px_rgba(15,23,42,0.08)]'
                  : 'text-foreground-muted hover:bg-card/60 hover:text-foreground-secondary'
              )}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                    active ? 'bg-primary/10 text-primary' : 'bg-card/70 text-foreground-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
