import type { Database } from './database.types';

export type {
  Database,
  Json,
  UserRole,
  OwnerVerificationStatus,
  HostelType,
  HostelStatus,
  BookingStatus,
  RequestStatus,
  OfferStatus,
  PaymentStage,
  PaymentStatusValue,
  NotificationType,
  ReportStatus,
  ReportTargetType,
  CommunityTopic,
  PromotionStatus,
} from './database.types';

/** Convenience row-type helpers so features don't reach into the generated tree. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type OwnerProfile = Tables<'owner_profiles'>;
export type Hostel = Tables<'hostels'>;
export type SeatType = Tables<'seat_types'>;
export type HostelImage = Tables<'hostel_images'>;
export type Facility = Tables<'facilities'>;
export type Booking = Tables<'bookings'>;
export type HostelRequest = Tables<'requests'>;
export type Offer = Tables<'offers'>;
export type Payment = Tables<'payments'>;
export type Notification = Tables<'notifications'>;
export type PushToken = Tables<'push_tokens'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type Review = Tables<'reviews'>;
export type Report = Tables<'reports'>;
export type Block = Tables<'blocks'>;
export type SavedHostel = Tables<'saved_hostels'>;
export type CommunityPost = Tables<'community_posts'>;
export type CommunityReply = Tables<'community_replies'>;
export type Promotion = Tables<'promotions'>;

/** One row from the list_conversations RPC (other party + last message + unread). */
export type ConversationSummary =
  Database['public']['Functions']['list_conversations']['Returns'][number];
