/**
 * GENERATED FILE — do not edit by hand.
 *
 * Regenerate with:  npm run db:types
 * (supabase gen types typescript --local > packages/shared/src/types/database.types.ts)
 *
 * This is a minimal hand-written stub for the M0 scaffold so the shared package
 * type-checks before the Supabase project is linked. Once `supabase db push` runs
 * against 0001_init.sql, replace this entirely with the generated output.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'student' | 'owner' | 'admin';

export type OwnerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type HostelType = 'boys' | 'girls' | 'co_living';
export type SeatTypeKey = 'single' | 'double' | 'triple' | 'quad' | 'dormitory';
export type HostelStatus =
  | 'draft'
  | 'pending'
  | 'verified'
  | 'published'
  | 'unpublished'
  | 'rejected';

export type PaymentMethod = 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cash';

export type BookingStatus =
  | 'pending'
  | 'payment_pending_approval'
  | 'awaiting_advance'
  | 'advance_submitted'
  | 'advance_rejected'
  | 'pending_owner_confirmation'
  | 'reserved'
  | 'moved_in'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export type RequestStatus =
  | 'open'
  | 'booked'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'closed';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';

export type PaymentStage = 'advance' | 'balance';
export type PaymentStatusValue = 'submitted' | 'confirmed' | 'rejected';

export type CommunityTopic = 'general' | 'area' | 'budget' | 'facilities' | 'food' | 'safety';

export type PromotionPlan = 'featured_1d' | 'featured_3d' | 'featured_7d' | 'featured_30d';
export type PromotionStatus = 'pending' | 'active' | 'rejected' | 'expired';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type ReportTargetType = 'hostel' | 'review' | 'message' | 'profile' | 'request';

export type NotificationType =
  | 'hostel_approved'
  | 'hostel_rejected'
  | 'booking_created'
  | 'booking_status'
  | 'booking_cancelled'
  | 'offer_received'
  | 'offer_accepted'
  | 'payment_submitted'
  | 'payment_confirmed'
  | 'payment_rejected'
  | 'new_message'
  | 'review_received';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          gender: string | null;
          institution: string | null;
          avatar_url: string | null;
          suspended: boolean;
          suspended_at: string | null;
          suspended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          gender?: string | null;
          institution?: string | null;
          avatar_url?: string | null;
          suspended?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          gender?: string | null;
          institution?: string | null;
          avatar_url?: string | null;
          suspended?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      owner_profiles: {
        Row: {
          id: string;
          business_name: string | null;
          cnic: string | null;
          cnic_front_url: string | null;
          cnic_back_url: string | null;
          ownership_proof_url: string | null;
          address: string | null;
          city: string | null;
          status: OwnerVerificationStatus;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          cnic?: string | null;
          cnic_front_url?: string | null;
          cnic_back_url?: string | null;
          ownership_proof_url?: string | null;
          address?: string | null;
          city?: string | null;
          status?: OwnerVerificationStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          cnic?: string | null;
          cnic_front_url?: string | null;
          cnic_back_url?: string | null;
          ownership_proof_url?: string | null;
          address?: string | null;
          city?: string | null;
          status?: OwnerVerificationStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hostels: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          hostel_type: HostelType;
          description: string | null;
          address: string | null;
          city: string | null;
          nearest_institution: string | null;
          latitude: number | null;
          longitude: number | null;
          house_rules: string | null;
          meal_plan: string | null;
          curfew: string | null;
          security_deposit_months: number;
          cover_image_url: string | null;
          status: HostelStatus;
          avg_rating: number;
          review_count: number;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          hostel_type: HostelType;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          nearest_institution?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          house_rules?: string | null;
          meal_plan?: string | null;
          curfew?: string | null;
          security_deposit_months?: number;
          cover_image_url?: string | null;
          status?: HostelStatus;
          avg_rating?: number;
          review_count?: number;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hostels']['Insert']>;
        Relationships: [];
      };
      seat_types: {
        Row: {
          id: string;
          hostel_id: string;
          occupancy: SeatTypeKey;
          monthly_rent: number;
          total_seats: number;
          is_ac: boolean;
          attached_bath: boolean;
          discount_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          occupancy: SeatTypeKey;
          monthly_rent: number;
          total_seats: number;
          is_ac?: boolean;
          attached_bath?: boolean;
          discount_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['seat_types']['Insert']>;
        Relationships: [];
      };
      hostel_images: {
        Row: {
          id: string;
          hostel_id: string;
          url: string;
          is_cover: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          url: string;
          is_cover?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hostel_images']['Insert']>;
        Relationships: [];
      };
      facilities: {
        Row: { id: string; key: string; label: string; category: string | null };
        Insert: { id?: string; key: string; label: string; category?: string | null };
        Update: Partial<Database['public']['Tables']['facilities']['Insert']>;
        Relationships: [];
      };
      hostel_facilities: {
        Row: { hostel_id: string; facility_id: string };
        Insert: { hostel_id: string; facility_id: string };
        Update: Partial<Database['public']['Tables']['hostel_facilities']['Insert']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          hostel_id: string;
          seat_type_id: string;
          student_id: string;
          owner_id: string;
          occupancy: SeatTypeKey;
          monthly_rent: number;
          discount_percent: number;
          effective_rent: number;
          advance_amount: number;
          balance_amount: number;
          security_deposit: number;
          move_in_date: string;
          duration_months: number;
          special_requests: string | null;
          payment_method: PaymentMethod;
          status: BookingStatus;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id?: string;
          seat_type_id: string;
          student_id: string;
          owner_id?: string;
          occupancy?: SeatTypeKey;
          monthly_rent?: number;
          discount_percent?: number;
          effective_rent?: number;
          advance_amount?: number;
          balance_amount?: number;
          security_deposit?: number;
          move_in_date: string;
          duration_months?: number;
          special_requests?: string | null;
          payment_method: PaymentMethod;
          status?: BookingStatus;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          student_id: string;
          hostel_type: HostelType | null;
          seat_type: SeatTypeKey | null;
          city: string | null;
          nearest_institution: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_date: string | null;
          duration_months: number;
          notes: string | null;
          status: RequestStatus;
          accepted_offer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          hostel_type?: HostelType | null;
          seat_type?: SeatTypeKey | null;
          city?: string | null;
          nearest_institution?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_date?: string | null;
          duration_months?: number;
          notes?: string | null;
          status?: RequestStatus;
          accepted_offer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          request_id: string;
          owner_id: string;
          hostel_id: string;
          seat_type_id: string | null;
          monthly_rent: number;
          message: string | null;
          status: OfferStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          owner_id: string;
          hostel_id: string;
          seat_type_id?: string | null;
          monthly_rent: number;
          message?: string | null;
          status?: OfferStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['offers']['Insert']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          payer_id: string;
          stage: PaymentStage;
          amount: number;
          method: PaymentMethod;
          proof_url: string | null;
          status: PaymentStatusValue;
          rejection_reason: string | null;
          confirmed_by: string | null;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payer_id?: string;
          stage: PaymentStage;
          amount?: number;
          method: PaymentMethod;
          proof_url?: string | null;
          status?: PaymentStatusValue;
          rejection_reason?: string | null;
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['push_tokens']['Insert']>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          student_id: string;
          owner_id: string;
          hostel_id: string | null;
          student_pinned: boolean;
          owner_pinned: boolean;
          is_blocked: boolean;
          blocked_by: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          owner_id: string;
          hostel_id?: string | null;
          student_pinned?: boolean;
          owner_pinned?: boolean;
          is_blocked?: boolean;
          blocked_by?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          hostel_id: string;
          booking_id: string;
          student_id: string;
          reviewer_name: string | null;
          rating_overall: number;
          rating_cleanliness: number | null;
          rating_facilities: number | null;
          rating_location: number | null;
          rating_value: number | null;
          comment: string | null;
          owner_response: string | null;
          owner_responded_at: string | null;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id?: string;
          booking_id: string;
          student_id?: string;
          reviewer_name?: string | null;
          rating_overall: number;
          rating_cleanliness?: number | null;
          rating_facilities?: number | null;
          rating_location?: number | null;
          rating_value?: number | null;
          comment?: string | null;
          owner_response?: string | null;
          owner_responded_at?: string | null;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          status: ReportStatus;
          resolution_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          status?: ReportStatus;
          resolution_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: { id?: string; blocker_id: string; blocked_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['blocks']['Insert']>;
        Relationships: [];
      };
      saved_hostels: {
        Row: { student_id: string; hostel_id: string; created_at: string };
        Insert: { student_id: string; hostel_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['saved_hostels']['Insert']>;
        Relationships: [];
      };
      hostel_views: {
        Row: { student_id: string; hostel_id: string; viewed_at: string; view_count: number };
        Insert: {
          student_id: string;
          hostel_id: string;
          viewed_at?: string;
          view_count?: number;
        };
        Update: Partial<Database['public']['Tables']['hostel_views']['Insert']>;
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          author_id: string;
          author_name: string | null;
          topic: CommunityTopic;
          title: string;
          body: string;
          is_anonymous: boolean;
          like_count: number;
          reply_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string;
          author_name?: string | null;
          topic?: CommunityTopic;
          title: string;
          body: string;
          is_anonymous?: boolean;
          like_count?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
        Relationships: [];
      };
      community_replies: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          author_name: string | null;
          body: string;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id?: string;
          author_name?: string | null;
          body: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_replies']['Insert']>;
        Relationships: [];
      };
      post_likes: {
        Row: { post_id: string; user_id: string; created_at: string };
        Insert: { post_id: string; user_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['post_likes']['Insert']>;
        Relationships: [];
      };
      promotions: {
        Row: {
          id: string;
          hostel_id: string;
          owner_id: string;
          plan: PromotionPlan;
          payment_method: PaymentMethod;
          proof_url: string | null;
          status: PromotionStatus;
          starts_at: string | null;
          expires_at: string | null;
          impressions: number;
          clicks: number;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          owner_id?: string;
          plan: PromotionPlan;
          payment_method: PaymentMethod;
          proof_url?: string | null;
          status?: PromotionStatus;
          starts_at?: string | null;
          expires_at?: string | null;
          impressions?: number;
          clicks?: number;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          detail: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          detail?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_or_create_conversation: {
        Args: { p_other_id: string; p_hostel_id?: string | null };
        Returns: string;
      };
      list_conversations: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          other_id: string;
          other_name: string | null;
          hostel_id: string | null;
          hostel_name: string | null;
          last_message_at: string | null;
          last_message: string | null;
          unread_count: number;
          is_blocked: boolean;
          blocked_by: string | null;
          pinned: boolean;
        }[];
      };
      toggle_conversation_pin: {
        Args: { p_conversation_id: string; p_pinned: boolean };
        Returns: undefined;
      };
      set_conversation_block: {
        Args: { p_conversation_id: string; p_blocked: boolean };
        Returns: undefined;
      };
      mark_conversation_read: {
        Args: { p_conversation_id: string };
        Returns: undefined;
      };
      track_promotion_event: {
        Args: { p_hostel_id: string; p_event: string };
        Returns: undefined;
      };
      seat_availability: {
        Args: { p_hostel_id: string };
        Returns: {
          seat_type_id: string;
          occupancy: SeatTypeKey;
          total_seats: number;
          booked_seats: number;
          available_seats: number;
        }[];
      };
      search_hostels: {
        Args: {
          p_q?: string | null;
          p_city?: string | null;
          p_hostel_type?: HostelType | null;
          p_seat_type?: SeatTypeKey | null;
          p_min_price?: number | null;
          p_max_price?: number | null;
          p_facility_ids?: string[] | null;
          p_lat?: number | null;
          p_lng?: number | null;
          p_sort?: string | null;
        };
        Returns: {
          id: string;
          owner_id: string;
          name: string;
          hostel_type: HostelType;
          city: string | null;
          nearest_institution: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          cover_image_url: string | null;
          avg_rating: number;
          review_count: number;
          cheapest_rent: number | null;
          seat_type_count: number;
          distance_km: number | null;
          is_featured: boolean;
        }[];
      };
      track_hostel_view: {
        Args: { p_hostel_id: string };
        Returns: undefined;
      };
      get_recommendations: {
        Args: { p_limit?: number | null };
        Returns: Database['public']['Functions']['search_hostels']['Returns'];
      };
      admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          owners_pending: number;
          owners_approved: number;
          owners_suspended: number;
          listings_pending: number;
          listings_published: number;
          reports_open: number;
          promotions_pending: number;
          bookings_active: number;
          bookings_total: number;
          users_total: number;
          new_users_7d: number;
          new_users_30d: number;
        }[];
      };
      log_activity: {
        Args: {
          p_action: string;
          p_target_type?: string | null;
          p_target_id?: string | null;
          p_detail?: Record<string, unknown> | null;
        };
        Returns: undefined;
      };
      admin_set_user_suspended: {
        Args: { p_user_id: string; p_suspended: boolean; p_reason?: string | null };
        Returns: undefined;
      };
      admin_list_bookings: {
        Args: { p_status?: BookingStatus | null; p_limit?: number | null };
        Returns: {
          id: string;
          hostel_id: string;
          hostel_name: string | null;
          student_name: string | null;
          owner_name: string | null;
          occupancy: SeatTypeKey;
          status: BookingStatus;
          payment_method: PaymentMethod;
          effective_rent: number;
          advance_amount: number;
          move_in_date: string;
          created_at: string;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      owner_verification_status: OwnerVerificationStatus;
      hostel_type: HostelType;
      seat_type: SeatTypeKey;
      hostel_status: HostelStatus;
      payment_method: PaymentMethod;
      booking_status: BookingStatus;
      request_status: RequestStatus;
      offer_status: OfferStatus;
      payment_stage: PaymentStage;
      payment_status: PaymentStatusValue;
      notification_type: NotificationType;
      report_status: ReportStatus;
      report_target_type: ReportTargetType;
      community_topic: CommunityTopic;
      promotion_plan: PromotionPlan;
      promotion_status: PromotionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
