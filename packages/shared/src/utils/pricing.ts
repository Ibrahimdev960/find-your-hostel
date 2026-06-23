import { BALANCE_PERCENT, PAYMENT } from '../config/constants';

export type PriceBreakdown = {
  monthlyRent: number;
  advance: number;
  balance: number;
  securityDeposit: number;
  /** Due at move-in = remaining rent + deposit. */
  dueAtMoveIn: number;
  total: number;
};

/**
 * Canonical price breakdown for a booking. Mirrors CLAUDE.md §5.6:
 * advance = 20% of first month's rent; balance = 80%; deposit = 1 month (refundable).
 */
export function computePriceBreakdown(
  monthlyRent: number,
  discountPercent = 0
): PriceBreakdown {
  const effectiveRent = Math.round(monthlyRent * (1 - discountPercent));
  const advance = Math.round(effectiveRent * PAYMENT.ADVANCE_PERCENT);
  const balance = Math.round(effectiveRent * BALANCE_PERCENT);
  const securityDeposit = effectiveRent * PAYMENT.SECURITY_DEPOSIT_MONTHS;
  return {
    monthlyRent: effectiveRent,
    advance,
    balance,
    securityDeposit,
    dueAtMoveIn: balance + securityDeposit,
    total: advance + balance + securityDeposit,
  };
}
