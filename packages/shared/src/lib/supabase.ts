import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

/**
 * Supabase dependency injection.
 *
 * The shared package NEVER creates a Supabase client — each app builds its own
 * (web: @supabase/ssr cookies; mobile: supabase-js + expo-secure-store) and calls
 * `initSupabase(client)` exactly once at startup. Every shared api/ function then
 * reaches the client through `getSupabase()`. This keeps the core platform-agnostic.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

let client: TypedSupabaseClient | null = null;

/** Inject the app-specific Supabase client. Call once per app at startup. */
export function initSupabase(instance: TypedSupabaseClient): void {
  client = instance;
}

/** Accessor used by every shared api/ function. Throws if init was skipped. */
export function getSupabase(): TypedSupabaseClient {
  if (!client) {
    throw new Error(
      '[shared] Supabase client not initialised. Call initSupabase(client) once at app startup.'
    );
  }
  return client;
}

/** Mainly for tests / hot-reload teardown. */
export function resetSupabase(): void {
  client = null;
}
