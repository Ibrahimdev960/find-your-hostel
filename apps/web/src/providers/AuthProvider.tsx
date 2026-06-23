'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { initSupabase, useAuthStore, type UserRole } from '@findyourhostel/shared';
import { createClient } from '@/lib/supabase/client';

/**
 * Boots the shared Supabase injection ONCE and keeps the shared authStore in sync
 * with Supabase auth state. Every shared hook/api then works through getSupabase().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const initialized = useRef(false);

  if (!initialized.current) {
    // Inject synchronously on first render so children can rely on getSupabase().
    initSupabase(createClient());
    initialized.current = true;
  }

  useEffect(() => {
    const supabase = createClient();

    const syncRole = async (userId: string, email: string | null) => {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      setUser({ id: userId, email, role: (data?.role as UserRole) ?? null });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void syncRole(session.user.id, session.user.email ?? null);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void syncRole(session.user.id, session.user.email ?? null);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
