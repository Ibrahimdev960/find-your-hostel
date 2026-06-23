import { format } from 'date-fns';

/** PKR currency formatting (the platform's primary market). */
export function formatCurrency(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | number | Date, pattern = 'dd MMM yyyy'): string {
  return format(new Date(value), pattern);
}

/** "12,500/mo" style short rent label. */
export function formatRent(amount: number): string {
  return `${formatCurrency(amount)}/mo`;
}
