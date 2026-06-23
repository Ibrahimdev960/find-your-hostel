import { z } from 'zod';

/** Step 1 — Basics. */
export const hostelBasicsSchema = z.object({
  name: z.string().min(2, 'Enter the hostel name'),
  hostel_type: z.enum(['boys', 'girls', 'co_living']),
  nearest_institution: z.string().optional().nullable(),
  address: z.string().min(3, 'Enter the address'),
  city: z.string().min(2, 'Enter the city'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  description: z.string().optional().nullable(),
});

/** Step 2 — a single seat type row. */
export const seatTypeSchema = z.object({
  occupancy: z.enum(['single', 'double', 'triple', 'quad', 'dormitory']),
  monthly_rent: z.number({ invalid_type_error: 'Enter rent' }).min(0, 'Rent must be ≥ 0'),
  total_seats: z.number({ invalid_type_error: 'Enter seats' }).int().min(1, 'At least 1 seat'),
  is_ac: z.boolean().default(false),
  attached_bath: z.boolean().default(false),
  discount_percent: z.number().min(0).max(50).default(0),
});

export const roomsSchema = z.object({
  seat_types: z.array(seatTypeSchema).min(1, 'Add at least one seat type'),
});

/** Step 3 — Facilities & Rules. */
export const facilitiesRulesSchema = z.object({
  facility_ids: z.array(z.string()).default([]),
  house_rules: z.string().optional().nullable(),
  curfew: z.string().optional().nullable(),
  meal_plan: z.string().optional().nullable(),
});

/** Step 4 — Pricing. */
export const pricingSchema = z.object({
  security_deposit_months: z.number().min(0).max(6).default(1),
});

/** Step 5 — Media. */
export const mediaSchema = z.object({
  cover_image_url: z.string().optional().nullable(),
  image_urls: z.array(z.string()).default([]),
});

/** The persisted hostel row fields (everything except seat types / facilities / images). */
export const hostelDetailsSchema = hostelBasicsSchema
  .merge(facilitiesRulesSchema.omit({ facility_ids: true }))
  .merge(pricingSchema);

export type HostelBasicsInput = z.infer<typeof hostelBasicsSchema>;
export type SeatTypeInput = z.infer<typeof seatTypeSchema>;
export type FacilitiesRulesInput = z.infer<typeof facilitiesRulesSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type HostelDetailsInput = z.infer<typeof hostelDetailsSchema>;

/** Owner submits an offer on a student's request (booking path B). */
export const submitOfferSchema = z.object({
  request_id: z.string().uuid(),
  hostel_id: z.string().uuid({ message: 'Pick one of your hostels' }),
  seat_type_id: z.string().uuid().optional(),
  monthly_rent: z.coerce.number().positive('Enter the monthly rent'),
  message: z.string().max(500).optional(),
});

export type SubmitOfferInput = z.infer<typeof submitOfferSchema>;
