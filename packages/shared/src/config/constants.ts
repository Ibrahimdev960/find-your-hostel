/**
 * Configurable business defaults — the "numbers that matter" from CLAUDE.md §5.
 * Centralized so rules live in one place (also mirrored by DB constraints/triggers).
 */
export const PAYMENT = {
  /** Advance is 20% of the first month's rent; reserves the seat. */
  ADVANCE_PERCENT: 0.2,
  /** Security deposit defaults to 1 month's rent (refundable). */
  SECURITY_DEPOSIT_MONTHS: 1,
} as const;

/** Balance due at move-in = remaining rent + deposit. */
export const BALANCE_PERCENT = 1 - PAYMENT.ADVANCE_PERCENT;

/** Max per-seat discount an owner can set. */
export const MAX_DISCOUNT_PERCENT = 0.5;

export const SEAT_TYPES = ['single', 'double', 'triple', 'quad', 'dormitory'] as const;
export type SeatTypeKey = (typeof SEAT_TYPES)[number];

export const HOSTEL_CATEGORIES = ['boys', 'girls', 'co_living'] as const;
export type HostelCategory = (typeof HOSTEL_CATEGORIES)[number];

export const PROMOTION_PLANS = ['featured_1d', 'featured_3d', 'featured_7d', 'featured_30d'] as const;
export type PromotionPlan = (typeof PROMOTION_PLANS)[number];

/** Days each promotion plan runs once approved. */
export const PROMOTION_PLAN_DAYS: Record<PromotionPlan, number> = {
  featured_1d: 1,
  featured_3d: 3,
  featured_7d: 7,
  featured_30d: 30,
};

export const PAYMENT_METHODS = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
