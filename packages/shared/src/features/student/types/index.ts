import type { Database } from '../../../types/database.types';
import type {
  Hostel,
  SeatType,
  HostelImage,
  Facility,
  Booking,
  HostelRequest,
  Offer,
} from '../../../types';

/** A search result card (one row from the search_hostels RPC). */
export type SearchHostelCard =
  Database['public']['Functions']['search_hostels']['Returns'][number];

/** Full public hostel detail (published) with its child rows + facility labels. */
export type PublicHostel = Hostel & {
  seat_types: SeatType[];
  hostel_images: HostelImage[];
  facilities: Facility[];
};

/** Live seat availability row (one per seat type) from the seat_availability RPC. */
export type SeatAvailability =
  Database['public']['Functions']['seat_availability']['Returns'][number];

/** A booking joined to a lightweight slice of its hostel — for booking lists/detail. */
export type BookingWithHostel = Booking & {
  hostel: Pick<Hostel, 'id' | 'name' | 'city' | 'nearest_institution' | 'cover_image_url'> | null;
};

/** A request with its live offer count (PostgREST `offers(count)` aggregate). */
export type RequestWithOfferCount = HostelRequest & {
  offers: { count: number }[];
};

/** An offer joined to a lightweight slice of the offered hostel — for the student review list. */
export type OfferWithHostel = Offer & {
  hostel: Pick<Hostel, 'id' | 'name' | 'city' | 'nearest_institution'> | null;
};
