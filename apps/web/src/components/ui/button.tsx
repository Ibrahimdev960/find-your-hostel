import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

/**
 * Pill buttons (designer.md §9). One accent (primary=terracotta). Destructive is
 * de-emphasized by default — it only reddens on hover, so "Delete/Cancel" never
 * carries the loudest styling.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary:
          'border border-border bg-card text-foreground-secondary hover:bg-background-secondary',
        outline:
          'border border-border bg-card text-foreground-secondary hover:bg-background-secondary',
        ghost: 'text-foreground-muted hover:bg-card hover:text-foreground',
        link: 'rounded-none text-primary underline-offset-4 hover:underline',
        destructive: 'bg-error text-white hover:opacity-90',
        // Neutral until hover, then reddens — the preferred "delete" treatment.
        destructiveGhost:
          'border border-border bg-card text-foreground-secondary hover:border-error/40 hover:bg-error/10 hover:text-error',
      },
      size: {
        // Touch devices get a 44px floor via the `coarse:` variant without
        // inflating the compact desktop sizing (responsive-plan.md §2).
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 px-3.5 text-xs coarse:h-11',
        lg: 'h-12 px-6',
        icon: 'h-9 w-9 coarse:h-11 coarse:w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { buttonVariants };
