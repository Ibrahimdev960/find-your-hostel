import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback — exchanges the `code` from email confirmation / password-recovery
 * links for a session cookie, then redirects to `next` (default home).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
