'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/cn';

/** Initials from a display name (e.g. "Ayesha Khan" → "AK"). */
function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Avatar (designer.md §4) — rounded-full, initials fallback. */
export function Avatar({
  name,
  src,
  className,
}: {
  name?: string | null;
  src?: string | null;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex h-9 w-9 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background-secondary',
        className
      )}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={name ?? ''} className="h-full w-full object-cover" />
      )}
      <AvatarPrimitive.Fallback className="text-xs font-semibold text-foreground-secondary">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
