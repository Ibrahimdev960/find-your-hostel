import { registerPushToken } from '@findyourhostel/shared/api';

const TOKEN_KEY = 'fyh_web_push_token';

/**
 * Request browser notification permission and register a web push token via the shared
 * API (same `registerPushToken` mobile uses). Actual delivery is handled by a DB webhook
 * (infra) — this records the token + permission. Returns true if enabled.
 */
export async function enableWebPush(userId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const rand = Math.random().toString(36).slice(2, 10);
    token = `web:${userId}:${rand}`;
    localStorage.setItem(TOKEN_KEY, token);
  }
  await registerPushToken({ userId, token, platform: 'web' });
  return true;
}
