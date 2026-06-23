import type { ZodError } from 'zod';

/** Flatten a ZodError into a { field: message } map for form display. */
export function parseZodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
