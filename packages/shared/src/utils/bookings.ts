import type { PaymentMethod, SeatTypeKey, PromotionPlan } from '../config/constants';
import type {
  BookingStatus,
  OfferStatus,
  RequestStatus,
  PaymentStage,
  PaymentStatusValue,
  PromotionStatus,
} from '../types';

/** Human labels for the booking lifecycle (CLAUDE.md §5.8). */
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  payment_pending_approval: 'Payment Pending Approval',
  awaiting_advance: 'Awaiting Advance',
  advance_submitted: 'Advance Submitted',
  advance_rejected: 'Advance Rejected',
  pending_owner_confirmation: 'Pending Owner Confirmation',
  reserved: 'Reserved',
  moved_in: 'Moved In',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  cash: 'Cash on the Spot',
};

export const SEAT_TYPE_LABEL: Record<SeatTypeKey, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quad',
  dormitory: 'Dormitory',
};

/** Terminal statuses: the booking is finished and no longer holds a seat. */
export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  'completed',
  'cancelled',
  'rejected',
  'expired',
];

/** A booking that still holds a seat (mirrors booking_consumes_seat in the DB). */
export function bookingConsumesSeat(status: BookingStatus): boolean {
  return !TERMINAL_BOOKING_STATUSES.includes(status);
}

/** A student may cancel only before the booking goes active/terminal. */
export function isCancellable(status: BookingStatus): boolean {
  return !['active', 'completed', 'cancelled', 'rejected', 'expired'].includes(status);
}

/** Coarse tone for status badges (UI maps this to colours). */
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export function bookingStatusTone(status: BookingStatus): StatusTone {
  if (status === 'active' || status === 'reserved' || status === 'moved_in') return 'success';
  if (status === 'completed') return 'neutral';
  if (status === 'cancelled' || status === 'rejected' || status === 'expired' || status === 'advance_rejected')
    return 'danger';
  return 'warning';
}

// ── Requests & Offers (M5) ───────────────────────────────────────────────────

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  open: 'Open',
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  closed: 'Closed',
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
};

export function requestStatusTone(status: RequestStatus): StatusTone {
  if (status === 'open') return 'success';
  if (status === 'booked') return 'warning';
  if (status === 'cancelled' || status === 'expired') return 'danger';
  return 'neutral';
}

export function offerStatusTone(status: OfferStatus): StatusTone {
  if (status === 'accepted') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

/** A student may still act on (cancel/clone) a request that isn't terminal-booked. */
export function isRequestOpen(status: RequestStatus): boolean {
  return status === 'open';
}

// ── Payments (M6) ────────────────────────────────────────────────────────────

export const PAYMENT_STAGE_LABEL: Record<PaymentStage, string> = {
  advance: 'Advance',
  balance: 'Balance & deposit',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusValue, string> = {
  submitted: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

export function paymentStatusTone(status: PaymentStatusValue): StatusTone {
  if (status === 'confirmed') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

/** Which payment stage is due for a booking status, or null if none is collectable now. */
export function duePaymentStage(status: BookingStatus): PaymentStage | null {
  if (status === 'awaiting_advance' || status === 'advance_rejected') return 'advance';
  if (status === 'reserved' || status === 'moved_in') return 'balance';
  return null;
}

// ── Promotions (M11) ──────────────────────────────────────────────────────────

export const PROMOTION_PLAN_LABEL: Record<PromotionPlan, string> = {
  featured_1d: 'Featured · 1 day',
  featured_3d: 'Featured · 3 days',
  featured_7d: 'Featured · 7 days',
  featured_30d: 'Featured · 30 days',
};

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  pending: 'Pending review',
  active: 'Active',
  rejected: 'Rejected',
  expired: 'Expired',
};

export function promotionStatusTone(status: PromotionStatus): StatusTone {
  if (status === 'active') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}
