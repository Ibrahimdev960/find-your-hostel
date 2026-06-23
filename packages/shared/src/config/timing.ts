/** React Query timing constants — centralized so cache behaviour is consistent. */
export const STALE_TIME = {
  /** Realtime-backed data (notifications, chat) should never be considered fresh. */
  realtime: 0,
  short: 30_000,
  medium: 5 * 60_000,
  long: 30 * 60_000,
} as const;

/** Default move-in confirmation / unconfirmed-booking expiry windows (hours). */
export const EXPIRY = {
  unconfirmedBookingHours: 48,
  offerHours: 72,
} as const;
