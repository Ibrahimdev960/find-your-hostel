'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Bottom sheet (responsive-plan.md §4) — a mobile-friendly panel pinned to the
 * bottom of the viewport with a grab handle, scrollable body, and safe-area
 * padding. Built on Radix Dialog so it traps focus and closes on escape/backdrop.
 * Controlled via `open`/`onOpenChange`.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[24px] border border-border bg-card shadow-[0_-22px_70px_-40px_rgba(0,0,0,0.6)] focus:outline-none',
            className
          )}
        >
          {/* Grab handle */}
          <div className="flex justify-center pt-2.5">
            <span className="h-1.5 w-10 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-2">
            {title ? (
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                {title}
              </DialogPrimitive.Title>
            ) : (
              <DialogPrimitive.Title className="sr-only">Sheet</DialogPrimitive.Title>
            )}
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex h-9 w-9 coarse:h-11 coarse:w-11 items-center justify-center rounded-full text-foreground-muted transition hover:bg-background-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

          {footer && (
            <div className="border-t border-border px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
