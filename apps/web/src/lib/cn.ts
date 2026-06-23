import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx for conditionals + tailwind-merge to de-dupe conflicting classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
