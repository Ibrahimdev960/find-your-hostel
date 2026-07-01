/**
 * Plain-language label map (flow-audit §3) — the product word list.
 *
 * These are the strings SHOWN TO USERS. They replace system vocabulary
 * ("Awaiting Advance", "Occupancy", "Verified") with action-first plain English
 * so non-technical, low-literacy, low-English users understand every screen.
 *
 * The technical labels in `./bookings` (BOOKING_STATUS_LABEL, …) are kept for
 * internal/debug use; UI surfaces should prefer the helpers here. Where a status
 * reads differently to the two sides of a booking, the getters take a `viewer`
 * so student and owner each see the sentence that names THEIR next step.
 */
import type {
  BookingStatus,
  OfferStatus,
  RequestStatus,
  PaymentStage,
  PaymentStatusValue,
  HostelStatus,
} from '../types';

export type Viewer = 'student' | 'owner';

// ── Booking lifecycle ────────────────────────────────────────────────────────

const BOOKING_PLAIN_STUDENT: Record<BookingStatus, string> = {
  pending: 'Getting started',
  payment_pending_approval: 'Waiting for owner to confirm your payment',
  awaiting_advance: 'Pay deposit to reserve',
  advance_submitted: 'Deposit sent — waiting for owner',
  advance_rejected: "Owner couldn't confirm your deposit — resend",
  pending_owner_confirmation: 'Waiting for owner to confirm',
  reserved: 'Seat held for you',
  moved_in: "You've moved in",
  active: 'Your stay is active',
  completed: 'Stay completed',
  cancelled: 'Cancelled',
  rejected: 'Not accepted',
  expired: 'Expired',
};

const BOOKING_PLAIN_OWNER: Record<BookingStatus, string> = {
  pending: 'New booking',
  payment_pending_approval: 'Confirm the payment',
  awaiting_advance: 'Waiting for deposit',
  advance_submitted: 'Deposit sent — please confirm',
  advance_rejected: 'Deposit not confirmed',
  pending_owner_confirmation: 'Confirm this booking',
  reserved: 'Seat reserved',
  moved_in: 'Student moved in',
  active: 'Stay active',
  completed: 'Stay completed',
  cancelled: 'Cancelled',
  rejected: 'You declined',
  expired: 'Expired',
};

export function bookingStatusPlain(status: BookingStatus, viewer: Viewer = 'student'): string {
  return (viewer === 'owner' ? BOOKING_PLAIN_OWNER : BOOKING_PLAIN_STUDENT)[status];
}

// ── Payments ─────────────────────────────────────────────────────────────────

/** Plain names for the two money stages (flow-audit §3). */
export const PAYMENT_STAGE_PLAIN: Record<PaymentStage, string> = {
  advance: 'Booking deposit',
  balance: 'Remaining rent + refundable deposit',
};

/** One-line explainer for each money stage — purpose + timing. */
export const PAYMENT_STAGE_HINT: Record<PaymentStage, string> = {
  advance: '20% now to hold your seat',
  balance: 'Pay when you move in',
};

const PAYMENT_STATUS_PLAIN_STUDENT: Record<PaymentStatusValue, string> = {
  submitted: 'Sent — waiting for owner',
  confirmed: 'Confirmed',
  rejected: 'Not confirmed — resend',
};

const PAYMENT_STATUS_PLAIN_OWNER: Record<PaymentStatusValue, string> = {
  submitted: 'Please confirm',
  confirmed: 'Confirmed',
  rejected: 'You rejected this',
};

export function paymentStatusPlain(
  status: PaymentStatusValue,
  viewer: Viewer = 'student'
): string {
  return (viewer === 'owner' ? PAYMENT_STATUS_PLAIN_OWNER : PAYMENT_STATUS_PLAIN_STUDENT)[status];
}

/** Money-line labels used in price breakdowns (flow-audit §3). */
export const MONEY_LABEL = {
  advance: 'Booking deposit (20% now to hold your seat)',
  balance: 'Remaining rent (pay at move-in)',
  securityDeposit: 'Refundable deposit (returned when you leave)',
  dueAtMoveIn: 'To pay when you move in',
} as const;

// ── Requests & Offers ────────────────────────────────────────────────────────

export const REQUEST_STATUS_PLAIN: Record<RequestStatus, string> = {
  open: 'Waiting for offers',
  booked: 'Offer accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  closed: 'Closed',
};

const OFFER_PLAIN_STUDENT: Record<OfferStatus, string> = {
  pending: 'Awaiting your decision',
  accepted: 'Accepted',
  rejected: 'Declined',
  withdrawn: 'Withdrawn by owner',
  expired: 'Expired',
};

const OFFER_PLAIN_OWNER: Record<OfferStatus, string> = {
  pending: 'Waiting for student',
  accepted: 'Accepted',
  rejected: 'Declined',
  withdrawn: 'You withdrew this',
  expired: 'Expired',
};

export function offerStatusPlain(status: OfferStatus, viewer: Viewer = 'student'): string {
  return (viewer === 'owner' ? OFFER_PLAIN_OWNER : OFFER_PLAIN_STUDENT)[status];
}

// ── Hostel listing status (owner-facing) ─────────────────────────────────────

export const HOSTEL_STATUS_PLAIN: Record<HostelStatus, string> = {
  draft: 'Draft',
  pending: 'Waiting for approval',
  verified: 'Approved — ready to publish',
  published: 'Live',
  unpublished: 'Hidden',
  rejected: 'Not approved',
};

// ── Domain vocabulary (nouns shown in filters, forms, cards) ──────────────────

/** Hostel category — "Co-living" reads as jargon; show "Mixed / Family". */
export const HOSTEL_TYPE_PLAIN: Record<'boys' | 'girls' | 'co_living', string> = {
  boys: 'Boys',
  girls: 'Girls',
  co_living: 'Mixed / Family',
};
