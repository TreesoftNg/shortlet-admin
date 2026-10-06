/** Live booking shapes from shortlet-api (`/cc/bookings`, `/cc/units/:id/quote`). */

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type OfflinePaymentMethod = 'cash' | 'bank_transfer' | 'pos';

export type StayPrice = {
  currency: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightly: Array<{ date: string; rate: string; ruleId: string | null; ruleName: string | null }>;
  nightsSubtotal: string;
  discount: { kind: 'weekly' | 'monthly'; percent: string; amount: string } | null;
  staffDiscount?: { amount: string; reason: string } | null;
  cleaningFee: string;
  serviceFee: { percent: string; amount: string };
  tax: { name: string; percent: string; amount: string };
  total: string;
};

export type StaffQuote = {
  unitId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  price: StayPrice;
  deposit: { nights: number; nightlyRate: string; amount: string };
  totalDueNow: string;
  checkInTime: string;
  checkOutTime: string;
  houseRules: string | null;
};

export type AdminPayment = {
  id: string;
  provider: 'flutterwave' | 'offline';
  reference: string;
  providerTransactionId: string | null;
  amount: string;
  currency: string;
  status: 'initialized' | 'successful' | 'failed' | 'abandoned' | 'partially_refunded' | 'refunded';
  paymentMethod: string | null;
  offlineReference: string | null;
  checkoutUrl: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
};

export type AdminBooking = {
  id: string;
  reference: string;
  status: BookingStatus;
  source: 'website' | 'staff';
  unit: { id: string; name: string; publicName: string | null; propertyName: string | null };
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
  deposit: { amount: string; nights: number; status: string; refunded: string; dueAt: string | null };
  totalAmount: string;
  amountPaid: string;
  amountRefunded: string;
  holdExpiresAt: string | null;
  cancellationReason: string | null;
  payments: AdminPayment[];
};

export type StaffQuoteParams = {
  unitId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  discount?: number;
};

export type CreateStaffBookingInput = {
  unitId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  guest: { firstName: string; lastName: string; email: string; phone: string };
  specialRequests?: string | null;
  discount?: { amount: number; reason: string };
  payment:
    | { mode: 'offline'; method: OfflinePaymentMethod; reference?: string | null; receivedAt?: string }
    | { mode: 'link' };
};

export type CheckoutLink = {
  paymentId: string;
  reference: string;
  checkoutUrl: string;
  expiresAt: string;
};

export type CreatedStaffBooking = {
  booking: AdminBooking;
  checkout: CheckoutLink | null;
};

export type RecordOfflinePaymentInput = {
  method: OfflinePaymentMethod;
  reference?: string | null;
  receivedAt?: string;
};
