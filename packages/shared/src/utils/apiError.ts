import type { PostgrestError } from '@supabase/supabase-js';

/** Normalized error surfaced to UI from any shared api/ function. */
export class ApiError extends Error {
  code?: string;
  details?: string;

  constructor(message: string, code?: string, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/** Map a Supabase/Postgrest error into a friendly ApiError. Throw at the api/ boundary. */
export function toApiError(error: PostgrestError | Error | null, fallback = 'Something went wrong'): ApiError {
  if (!error) return new ApiError(fallback);
  if ('code' in error) {
    return new ApiError(error.message || fallback, error.code, (error as PostgrestError).details);
  }
  return new ApiError(error.message || fallback);
}

/** Guard helper: throw if Supabase returned an error or no row, else return data. */
export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) throw toApiError(result.error);
  if (result.data === null) throw new ApiError('No data returned', 'PGRST116');
  return result.data;
}
