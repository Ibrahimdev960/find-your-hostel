'use client';

import { useAuthStore } from '@findyourhostel/shared';
import { useGlobalNotificationsRealtime } from '@findyourhostel/shared/hooks';

/** Mounts the realtime notification subscription for the signed-in user. Renders nothing. */
export function NotificationsRealtime() {
  const user = useAuthStore((s) => s.user);
  useGlobalNotificationsRealtime(user?.id);
  return null;
}
