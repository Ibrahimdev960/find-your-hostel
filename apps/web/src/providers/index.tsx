'use client';

import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import toastLib from 'react-hot-toast';
import { setToastAdapter } from '@findyourhostel/shared';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { NotificationsRealtime } from '@/components/notifications/NotificationsRealtime';

/** Wire the shared toast abstraction to react-hot-toast (once). */
function useToastAdapter() {
  useEffect(() => {
    setToastAdapter({
      success: (m) => toastLib.success(m),
      error: (m) => toastLib.error(m),
      info: (m) => toastLib(m),
    });
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useToastAdapter();
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationsRealtime />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
