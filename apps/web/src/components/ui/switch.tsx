'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * Toggle/switch (designer.md §10). Uses a **flex track** so the knob can never
 * escape the track (no absolute-positioned translate). Accessible: role=switch +
 * aria-checked, keyboard-toggle via the underlying button.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  'aria-label': ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-60',
        checked ? 'justify-end bg-primary' : 'justify-start bg-border',
        className
      )}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}
