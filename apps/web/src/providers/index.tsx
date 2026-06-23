'use client';

import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import toastLib from 'react-hot-toast';
import { setToastAdapter } from '@findyourhostel/shared';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
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
    <QueryProvider>
      <AuthProvider>
        <NotificationsRealtime />
        {children}
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryProvider>
  );
}
