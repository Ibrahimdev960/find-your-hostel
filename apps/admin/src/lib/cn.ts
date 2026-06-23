import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** The shadcn/ui class combiner: clsx for conditionals + tailwind-merge to de-dupe. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
