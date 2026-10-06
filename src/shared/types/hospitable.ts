/**
 * Hospitable Public API v2–aligned DTOs.
 * Source shape: https://developer.hospitable.com/docs/public-api-docs
 * Keep field names snake_case to match Hospitable / Airbnb channel payloads.
 */

export type Platform =
  | 'airbnb'
  | 'homeaway'
  | 'booking'
  | 'direct'
  | 'manual'
  | string;

export type ReservationStatusCategory =
  | 'request'
  | 'accepted'
  | 'cancelled'
  | 'not accepted'
  | 'checkpoint'
  | 'unknown';

export type ReservationStatusSubCategory =
  | 'pending verification'
  | 'awaiting approval'
  | 'request to book'
  | 'request for payment'
  | 'declined'
  | 'withdrawn'
  | 'expired'
  | 'checkpoint'
  | 'voided'
  | string;

export type AvailabilityReason = 'AVAILABLE' | 'RESERVED' | 'BLOCKED';

export type AvailabilitySourceType =
  | 'USER'
  | 'VENDOR'
  | 'PLATFORM'
  | 'AVAILABILITY_WINDOW'
  | 'TURNOVER_DAY'
  | 'ADVANCED_NOTICE'
  | 'UPSELL'
  | 'RESERVATION';

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Address = {
  number?: string;
  street?: string;
  line1?: string;
  line2: string | null;
  city: string;
  state: string | null;
  zip: string | null;
  postcode?: string | null;
  country: string;
  display?: string;
  coordinates: Coordinates | null;
};

export type Capacity = {
  max: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
};

export type GuestCounts = {
  total: number;
  adult_count: number;
  child_count: number;
  infant_count: number;
  pet_count: number;
};

export type PropertyImage = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export type Listing = {
  id: string;
  channel: Platform;
  channel_listing_id: string;
  name: string;
  active: boolean;
};

export type Property = {
  id: string;
  name: string;
  public_name: string | null;
  picture: string | null;
  type: string;
  property_type: string;
  room_type: string;
  timezone: string;
  listed: boolean;
  /** Soft-deleted via DELETE /properties/:id. */
  archived: boolean;
  calendar_restricted: boolean;
  address: Address;
  /** Display labels for selected facilities. */
  amenities: string[];
  facility_ids: string[];
  /** From API unitCount when present. */
  unit_count: number;
  capacity: Capacity;
  description: string | null;
  summary: string | null;
  check_in: string | null;
  check_out: string | null;
  currency: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  listings?: Listing[];
  images?: PropertyImage[];
};

/** Tenant staff roles from POST /staff-invites and GET /auth/me. */
export type StaffRole = 'owner' | 'admin' | 'manager' | 'staff';

export type StaffStatus = 'active' | 'invited' | 'suspended';

export type StaffMember = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  status: StaffStatus;
  avatar_url: string | null;
  last_active_at: string | null;
  invited_at: string | null;
  /** Present for pending invites (from POST /staff-invites). */
  invite_expires_at: string | null;
  permissions: string[];
  is_you: boolean;
  created_at: string;
  updated_at: string;
};

/** Tenant admin settings (organization, notifications, payments, integrations). */
export type TenantOrganizationSettings = {
  name: string;
  legal_name: string;
  support_email: string;
  support_phone: string | null;
  timezone: string;
  currency: string;
  default_check_in: string;
  default_check_out: string;
};

export type TenantNotificationSettings = {
  email_new_booking: boolean;
  email_payment_received: boolean;
  email_refund_request: boolean;
  email_new_review: boolean;
  email_guest_message: boolean;
  digest_daily: boolean;
};

export type TenantPaymentSettings = {
  provider: 'flutterwave';
  public_key_hint: string;
  webhook_url: string;
  connected: boolean;
  settlement_currency: string;
};

export type TenantIntegration = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  status_label: string;
};

export type TenantSettings = {
  organization: TenantOrganizationSettings;
  notifications: TenantNotificationSettings;
  payments: TenantPaymentSettings;
  integrations: TenantIntegration[];
  updated_at: string;
};

/** Bookable inventory under a property (multi-unit extension).
 * Shared listing content (address, house rules, photos gallery) lives on
 * Property. Amenities are set per unit (can differ within the same property).
 * Ids match the Shortlet API (UUID strings).
 */
export type Unit = {
  id: string;
  property_id: string | null;
  /** Name when the API embeds the linked property. */
  linked_property_name: string | null;
  /** Short internal code (e.g. A, S1, PH-1). */
  code: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  /** Accept new bookings independently of ops status. */
  bookable: boolean;
  /** Floor / wing / location within the property. */
  floor: string | null;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  /** Nightly rate override; null inherits property/channel pricing. */
  base_rate: number | null;
  cleaning_fee: number | null;
  weekly_discount_percent: number | null;
  monthly_discount_percent: number | null;
  /** Facility catalog ids selected on this unit. */
  facility_ids: string[];
  /** Display labels for the selected facilities. */
  amenities: string[];
  /** Short label for calendars/lists (e.g. "Lagoon view corner"). */
  summary: string | null;
  /** Internal ops notes — never guest-facing. */
  notes: string | null;
  picture: string | null;
  /** City hint when the unit is not linked to a property yet. */
  city: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
};

export type Guest = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  locale: string | null;
  location: string | null;
  picture_url: string | null;
  thumbnail_url: string | null;
};

export type ReservationStatus = {
  category: ReservationStatusCategory;
  sub_category: ReservationStatusSubCategory;
};

export type ReservationStatusHistoryEntry = ReservationStatus & {
  changed_at: string;
};

export type ReservationStatusHistory = {
  current: ReservationStatus;
  history: ReservationStatusHistoryEntry[];
};

export type OtherFee = {
  amount: number;
  label: string;
};

export type ReservationFinancials = {
  accommodation: number;
  cleaning_fee: number;
  linen_fee: number;
  management_fee: number;
  resort_fee: number;
  pet_fee: number;
  pass_through_taxes: number;
  other_fees: OtherFee[];
  total: number;
  currency: string;
};

export type Reservation = {
  id: string;
  conversation_id: string;
  platform: Platform;
  /** Channel confirmation code (e.g. Airbnb code / our HVN-… reference). */
  platform_id: string;
  booking_date: string;
  arrival_date: string;
  departure_date: string;
  nights: number;
  check_in: string;
  check_out: string;
  last_message_at: string | null;
  reservation_status: ReservationStatusHistory;
  guests: GuestCounts;
  stay_type: string | null;
  issue_alert: string | null;
  created_at: string;
  updated_at: string;
  /** Local bookable unit (extension for multi-unit properties). */
  unit_id?: string | number;
  property?: Property;
  guest?: Guest;
  listing?: Listing;
  financials?: ReservationFinancials;
};

export type AvailabilityStatus = {
  reason: AvailabilityReason;
  source_type: AvailabilitySourceType | null;
  source: string | null;
  available: boolean;
};

export type CalendarPrice = {
  amount: number;
  currency: string;
  formatted: string;
};

export type CalendarDay = {
  date: string;
  day: string;
  min_stay: number;
  status: AvailabilityStatus;
  price: CalendarPrice;
  closed_for_checkin: boolean;
  closed_for_checkout: boolean;
};

export type DetailedRating = {
  type: 'cleanliness' | 'communication' | 'location' | 'checkin' | 'accuracy' | 'value';
  rating: number;
  comment: string;
};

export type Review = {
  id: string;
  platform: Platform;
  public: {
    rating: number;
    review: string | null;
    response: string | null;
  };
  private: {
    feedback: string | null;
    detailed_ratings: DetailedRating[] | null;
  };
  can_respond: boolean;
  responded_at: string | null;
  reviewed_at: string | null;
  /** Admin moderation extension for MVP dashboard. */
  moderation_status: 'published' | 'hidden' | 'pending';
  reservation?: Reservation;
  guest?: Guest;
};

export type Conversation = {
  id: string;
  status: 'open' | 'closed';
  unread_count: number;
  last_message_at: string;
  reservation?: Reservation;
  guest?: Guest;
};

export type Message = {
  id: string;
  platform: string;
  platform_id: string | number | null;
  conversation_id: string;
  reservation_id: string | null;
  body: string;
  content_type: 'text' | 'html' | string;
  sender_type: 'host' | 'guest' | 'system';
  sender_role: string;
  source: 'public_api' | 'platform' | 'automated' | 'hospitable' | 'AI';
  sender: {
    first_name: string;
    full_name: string;
    locale: string | null;
    picture_url: string | null;
    thumbnail_url: string | null;
    location: string | null;
  };
  attachments: Array<{ type: string; url: string }>;
  sent_reference_id: string | null;
  integration: string | null;
  created_at: string;
};

/** Internal payment record (not Hospitable-native; used by admin finance views). */
export type PaymentStatus =
  | 'INITIALIZED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type Payment = {
  id: string;
  reservation_id: string;
  provider: 'flutterwave';
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

/** Internal refund record (Flutterwave-backed; used by admin finance views). */
export type RefundStatus =
  | 'requested'
  | 'pending_approval'
  | 'processing'
  | 'completed'
  | 'rejected';

export type RefundReason =
  | 'guest_cancellation'
  | 'host_cancellation'
  | 'partial_stay'
  | 'service_issue'
  | 'duplicate_charge'
  | 'other';

export type Refund = {
  id: string;
  payment_id: string;
  reservation_id: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: RefundReason;
  notes: string | null;
  requested_by: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardKpi = {
  key: 'revenue' | 'bookings' | 'occupancy' | 'avg_nightly_rate';
  label: string;
  value: number;
  formatted_value: string;
  delta_percent: number;
  currency?: string;
};

export type OccupancyByProperty = {
  property_id: number;
  property_name: string;
  occupancy_percent: number;
  color: string;
};

export type TodayActivityItem = {
  id: string;
  guest_name: string;
  guest_picture_url: string | null;
  property_name: string;
  unit_name: string;
  time_label: string;
  type: 'check_in' | 'check_out';
};

export type RevenuePeriod = '7d' | '30d' | '90d' | '12m';

export type RevenuePoint = {
  date: string;
  label: string;
  amount: number;
};

export type RevenueOverview = {
  currency: string;
  y_axis_labels: string[];
  series: Record<RevenuePeriod, RevenuePoint[]>;
  comparison_series?: Record<RevenuePeriod, RevenuePoint[]>;
  highlight?: {
    period: RevenuePeriod;
    date: string;
    amount: number;
    formatted_amount: string;
  };
};

export type DashboardSummary = {
  greeting_name: string;
  period_label: string;
  kpis: DashboardKpi[];
  revenue_overview: RevenueOverview;
  occupancy_avg_percent: number;
  occupancy_by_property: OccupancyByProperty[];
  today: {
    check_ins: number;
    check_outs: number;
    items: TodayActivityItem[];
  };
  recent_reservations: Reservation[];
};

/** Admin reports payload (finance + ops rollups). */
export type PropertyPerformanceRow = {
  property_id: number;
  property_name: string;
  revenue: number;
  currency: string;
  bookings: number;
  occupancy_percent: number;
  avg_nightly_rate: number;
  nights_booked: number;
};

export type ChannelBreakdownRow = {
  channel: Platform;
  bookings: number;
  revenue: number;
  currency: string;
  share_percent: number;
};

export type ReportsFinanceSummary = {
  gross_revenue: number;
  refunds_issued: number;
  net_revenue: number;
  pending_refunds: number;
  currency: string;
};

export type ReportsPeriodSlice = {
  period_label: string;
  kpis: DashboardKpi[];
  occupancy_avg_percent: number;
  occupancy_by_property: OccupancyByProperty[];
  property_performance: PropertyPerformanceRow[];
  channel_breakdown: ChannelBreakdownRow[];
  finance: ReportsFinanceSummary;
};

export type ReportsSummary = {
  revenue_overview: RevenueOverview;
  by_period: Record<RevenuePeriod, ReportsPeriodSlice>;
};
