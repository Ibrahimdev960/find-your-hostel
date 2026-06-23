import { z } from 'zod';

export const sortOptions = ['relevance', 'price', 'distance', 'rating'] as const;

/** Public search filters (all optional — an empty filter returns all published hostels). */
export const searchFiltersSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  hostel_type: z.enum(['boys', 'girls', 'co_living']).optional(),
  seat_type: z.enum(['single', 'double', 'triple', 'quad', 'dormitory']).optional(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().nonnegative().optional(),
  facility_ids: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  sort: z.enum(sortOptions).default('relevance'),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type SortOption = (typeof sortOptions)[number];

/** Confirm-booking form. Pricing/owner/snapshot fields are filled server-side. */
export const createBookingSchema = z.object({
  seat_type_id: z.string().uuid(),
  move_in_date: z.string().min(1, 'Pick a move-in date'),
  duration_months: z.coerce.number().int().min(1, 'At least 1 month').max(24),
  payment_method: z.enum(['bank_transfer', 'jazzcash', 'easypaisa', 'cash']),
  special_requests: z.string().max(500).optional(),
  agree_terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Post a hostel request (booking path B). All preferences are optional except notes-free. */
export const createRequestSchema = z
  .object({
    hostel_type: z.enum(['boys', 'girls', 'co_living']).optional(),
    seat_type: z.enum(['single', 'double', 'triple', 'quad', 'dormitory']).optional(),
    city: z.string().max(120).optional(),
    nearest_institution: z.string().max(160).optional(),
    budget_min: z.coerce.number().nonnegative().optional(),
    budget_max: z.coerce.number().nonnegative().optional(),
    move_in_date: z.string().optional(),
    duration_months: z.coerce.number().int().min(1).max(24).default(1),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (v) => v.budget_min == null || v.budget_max == null || v.budget_max >= v.budget_min,
    { message: 'Max budget must be ≥ min budget', path: ['budget_max'] }
  );

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
