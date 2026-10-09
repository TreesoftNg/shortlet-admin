/** Shapes from GET /cc/bookings and related booking/payment views. */

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type DepositStatus =
  | 'pending'
  | 'held'
  | 'refunded'
  | 'partially_refunded'
  | 'retained'
  | 'none';

export type PaymentStatus =
  | 'initialized'
  | 'successful'
  | 'failed'
  | 'abandoned'
  | 'partially_refunded'
  | 'refunded';

export type RefundKind = 'stay' | 'deposit' | 'payment';

export type RefundReason =
  | 'guest_cancellation'
  | 'host_cancellation'
  | 'partial_stay'
  | 'service_issue'
  | 'duplicate_charge'
  | 'unavailable_after_payment'
  | 'deposit_release'
  | 'other';

export type RefundStatus = 'pending' | 'completed' | 'failed';

export type BookingCancelledBy = 'guest' | 'staff' | 'system';

export type BookingUnitSummary = {
  id: string;
  name: string;
  publicName: string | null;
  code: string | null;
  pictureUrl: string | null;
  propertyId: string | null;
  propertyName: string | null;
  address: string | null;
};

export type NightPrice = {
  date: string;
  rate: string;
  ruleId: string | null;
  ruleName: string | null;
};

export type StayPrice = {
  currency: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightly: NightPrice[];
  nightsSubtotal: string;
  discount: {
    kind: 'weekly' | 'monthly';
    percent: string;
    amount: string;
  } | null;
  cleaningFee: string;
  serviceFee: { percent: string; amount: string };
  tax: { name: string; percent: string; amount: string };
  total: string;
};

export type BookingDepositView = {
  amount: string;
  nights: number;
  status: DepositStatus;
  refunded: string;
  dueAt: string | null;
  deductionReason: string | null;
  settledAt: string | null;
};

export type PaymentView = {
  id: string;
  bookingId: string;
  bookingReference: string | null;
  guestName: string | null;
  unitName: string | null;
  provider: string;
  reference: string;
  providerTransactionId: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  providerFee: string | null;
  amountRefunded: string;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RefundView = {
  id: string;
  paymentId: string;
  bookingId: string;
  kind: RefundKind;
  amount: string;
  reason: RefundReason;
  note: string | null;
  status: RefundStatus;
  failureReason: string | null;
  requestedBy: { id: string; name: string } | null;
  processedAt: string | null;
  createdAt: string;
};

export type BookingTimelineEntry = { event: string; at: string };

export type BookingListItem = {
  id: string;
  reference: string;
  status: BookingStatus;
  unit: BookingUnitSummary;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  currency: string;
  totalAmount: string;
  amountPaid: string;
  amountRefunded: string;
  depositStatus: DepositStatus;
  depositDueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBooking = {
  id: string;
  reference: string;
  status: BookingStatus;
  unit: BookingUnitSummary;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  guests: { adults: number; children: number; infants: number };
  guest: { firstName: string; lastName: string; email: string; phone: string };
  specialRequests: string | null;
  currency: string;
  price: StayPrice;
  stayTotal: string;
  deposit: BookingDepositView;
  totalAmount: string;
  amountPaid: string;
  amountRefunded: string;
  houseRules: string | null;
  holdExpiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  customerId: string | null;
  cancelledBy: BookingCancelledBy | null;
  houseRulesAcceptedAt: string;
  checkedInAt: string | null;
  completedAt: string | null;
  expiredAt: string | null;
  stayRefunded: string;
  payments: PaymentView[];
  refunds: RefundView[];
  timeline: BookingTimelineEntry[];
};

export type ListBookingsParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  unitId?: string;
  propertyId?: string;
  from?: string;
  to?: string;
  deposit?: 'due' | 'overdue';
  search?: string;
};

export type PaginatedBookings = {
  items: BookingListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ReleaseDepositInput = {
  refundAmount: number;
  deductionReason?: string | null;
};

export type StaffRefundReason =
  | 'guest_cancellation'
  | 'host_cancellation'
  | 'partial_stay'
  | 'service_issue'
  | 'duplicate_charge'
  | 'other';

export const STAFF_REFUND_REASONS: { value: StaffRefundReason; label: string }[] = [
  { value: 'guest_cancellation', label: 'Guest cancellation' },
  { value: 'host_cancellation', label: 'Host cancellation' },
  { value: 'partial_stay', label: 'Partial stay' },
  { value: 'service_issue', label: 'Service issue' },
  { value: 'duplicate_charge', label: 'Duplicate charge' },
  { value: 'other', label: 'Other' },
];
