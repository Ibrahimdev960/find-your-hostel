'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import toastLib from 'react-hot-toast';
import { initSupabase, setToastAdapter, useAuthStore, type UserRole } from '@findyourhostel/shared';
import { createClient } from '@/lib/supabase/client';

function AuthSync({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const initialized = useRef(false);

  if (!initialized.current) {
    initSupabase(createClient());
    initialized.current = true;
  }

  useEffect(() => {
    const supabase = createClient();
    const sync = async (id: string, email: string | null) => {
      const { data } = await supabase.from('profiles').select('role').eq('id', id).single();
      setUser({ id, email, role: (data?.role as UserRole) ?? null });
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void sync(session.user.id, session.user.email ?? null);
      else setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) void sync(session.user.id, session.user.email ?? null);
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } })
  );

  useEffect(() => {
    setToastAdapter({
      success: (m) => toastLib.success(m),
      error: (m) => toastLib.error(m),
      info: (m) => toastLib(m),
    });
  }, []);

  return (
    <QueryClientProvider client={client}>
      <AuthSync>
        {children}
        <Toaster position="top-right" />
      </AuthSync>
    </QueryClientProvider>
  );
}
