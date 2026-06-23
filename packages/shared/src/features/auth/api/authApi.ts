import { getSupabase } from '../../../lib/supabase';
import { toApiError } from '../../../utils/apiError';
import type { RegisterInput } from '../schemas';

/**
 * Auth API — thin wrappers over Supabase Auth. The signup trigger (0001_init.sql)
 * creates the matching profiles row from raw_user_meta_data (role, full_name).
 */

export async function register(input: Omit<RegisterInput, 'confirmPassword'>) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { role: input.role, full_name: input.fullName },
    },
  });
  if (error) throw toApiError(error);
  return data;
}

export async function login(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toApiError(error);
  return data;
}

export async function logout() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw toApiError(error);
}

/** Sends a password-reset email; the link returns to `redirectTo`. */
export async function sendPasswordReset(email: string, redirectTo: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw toApiError(error);
}

/** Updates the password for the currently-authenticated (recovery) session. */
export async function updatePassword(password: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toApiError(error);
}
