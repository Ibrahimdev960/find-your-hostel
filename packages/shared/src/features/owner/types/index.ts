import type { Hostel, SeatType, HostelImage } from '../../../types';

/** A hostel with its child rows — what the detail view / wizard loads. */
export type HostelWithRelations = Hostel & {
  seat_types: SeatType[];
  hostel_images: HostelImage[];
  hostel_facilities: { facility_id: string }[];
};
