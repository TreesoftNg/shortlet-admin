import type {
  Guest,
  Property,
  Reservation,
  Unit,
} from '@/shared/types/hospitable';
import { formatMoney } from '@/features/bookings/utils/reservation-display';

export type BookingGuestMode = 'existing' | 'new';
export type BookingPaymentStatus = 'confirmed' | 'awaiting_payment';

export type BookingFormValues = {
  guest_mode: BookingGuestMode;
  guest_id: string | '';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_id: string | '';
  unit_id: string | '';
  arrival_date: string;
  departure_date: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  pet_count: number;
  payment_status: BookingPaymentStatus;
  notes: string;
};

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

export type BookingQuote = {
  nights: number;
  nightlyRate: number;
  accommodation: number;
  cleaningFee: number;
  total: number;
  currency: string;
};

export function createEmptyBookingForm(
  defaults?: Partial<BookingFormValues>,
): BookingFormValues {
  return {
    guest_mode: 'existing',
    guest_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    property_id: '',
    unit_id: '',
    arrival_date: '',
    departure_date: '',
    adult_count: 2,
    child_count: 0,
    infant_count: 0,
    pet_count: 0,
    payment_status: 'confirmed',
    notes: '',
    ...defaults,
  };
}

export function nightsBetween(arrivalDate: string, departureDate: string): number {
  if (!arrivalDate || !departureDate) return 0;
  const start = new Date(`${arrivalDate}T00:00:00`);
  const end = new Date(`${departureDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

export function getNightlyRate(unit: Unit | null, property: Property | null): number {
  if (unit?.base_rate != null && unit.base_rate > 0) return unit.base_rate;
  if (property) {
    // Soft default when unit inherits property pricing.
    return property.capacity.bedrooms >= 2 ? 90000 : 75000;
  }
  return 0;
}

export function estimateBookingQuote(
  values: BookingFormValues,
  unit: Unit | null,
  property: Property | null,
): BookingQuote {
  const nights = nightsBetween(values.arrival_date, values.departure_date);
  const nightlyRate = getNightlyRate(unit, property);
  const accommodation = nights * nightlyRate;
  const cleaningFee = nights > 0 ? Math.round(nightlyRate * 0.12) : 0;
  return {
    nights,
    nightlyRate,
    accommodation,
    cleaningFee,
    total: accommodation + cleaningFee,
    currency: property?.currency ?? 'NGN',
  };
}

export function validateBookingForm(
  values: BookingFormValues,
  options?: {
    unit?: Unit | null;
    property?: Property | null;
  },
): BookingFormErrors {
  const errors: BookingFormErrors = {};
  const unit = options?.unit ?? null;

  if (values.guest_mode === 'existing') {
    if (!values.guest_id) errors.guest_id = 'Select a customer';
  } else {
    if (!values.first_name.trim()) errors.first_name = 'First name is required';
    if (!values.last_name.trim()) errors.last_name = 'Last name is required';
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = 'Enter a valid email';
    }
  }

  if (!values.property_id) {
    errors.property_id = 'Select a property';
  }
  if (!values.unit_id) {
    errors.unit_id = 'Select a unit';
  }

  if (!values.arrival_date) errors.arrival_date = 'Check-in date is required';
  if (!values.departure_date) errors.departure_date = 'Checkout date is required';

  const nights = nightsBetween(values.arrival_date, values.departure_date);
  if (values.arrival_date && values.departure_date && nights < 1) {
    errors.departure_date = 'Checkout must be after check-in';
  }

  if (!Number.isFinite(values.adult_count) || values.adult_count < 1) {
    errors.adult_count = 'At least 1 adult is required';
  }
  if (!Number.isFinite(values.child_count) || values.child_count < 0) {
    errors.child_count = 'Children cannot be negative';
  }
  if (!Number.isFinite(values.infant_count) || values.infant_count < 0) {
    errors.infant_count = 'Infants cannot be negative';
  }
  if (!Number.isFinite(values.pet_count) || values.pet_count < 0) {
    errors.pet_count = 'Pets cannot be negative';
  }

  const totalGuests =
    Math.max(0, values.adult_count) + Math.max(0, values.child_count);
  if (unit && totalGuests > unit.capacity) {
    errors.adult_count = `This unit sleeps ${unit.capacity}`;
  }

  return errors;
}

export function formatQuoteLine(amount: number, currency: string): string {
  return formatMoney(amount, currency);
}

function randomCode(length: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function createPlatformId(): string {
  return `HVN-${randomCode(4)}-${randomCode(4)}`;
}

export function buildGuestFromForm(
  values: BookingFormValues,
  nextId: string,
): Guest {
  const first = values.first_name.trim();
  const last = values.last_name.trim();
  return {
    id: nextId,
    first_name: first,
    last_name: last,
    full_name: `${first} ${last}`.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    locale: 'en-NG',
    location: null,
    picture_url: null,
    thumbnail_url: null,
  };
}

export function buildReservationFromForm(
  values: BookingFormValues,
  context: {
    guest: Guest;
    property: Property;
    unit: Unit;
    nextId: string;
  },
): Reservation {
  const now = new Date().toISOString();
  const quote = estimateBookingQuote(values, context.unit, context.property);
  const checkInTime = context.property.check_in ?? '14:00';
  const checkOutTime = context.property.check_out ?? '11:00';
  const adult = Math.max(1, values.adult_count);
  const child = Math.max(0, values.child_count);
  const infant = Math.max(0, values.infant_count);
  const pet = Math.max(0, values.pet_count);

  const status =
    values.payment_status === 'awaiting_payment'
      ? {
          current: {
            category: 'request' as const,
            sub_category: 'request for payment',
          },
          history: [
            {
              category: 'request' as const,
              sub_category: 'request for payment',
              changed_at: now,
            },
          ],
        }
      : {
          current: {
            category: 'accepted' as const,
            sub_category: 'confirmed',
          },
          history: [
            {
              category: 'accepted' as const,
              sub_category: 'confirmed',
              changed_at: now,
            },
          ],
        };

  return {
    id: context.nextId,
    conversation_id: `conv-${context.nextId}`,
    platform: 'direct',
    platform_id: createPlatformId(),
    booking_date: now,
    arrival_date: values.arrival_date,
    departure_date: values.departure_date,
    nights: quote.nights,
    check_in: `${values.arrival_date}T${checkInTime}:00+01:00`,
    check_out: `${values.departure_date}T${checkOutTime}:00+01:00`,
    last_message_at: null,
    reservation_status: status,
    guests: {
      total: adult + child + infant,
      adult_count: adult,
      child_count: child,
      infant_count: infant,
      pet_count: pet,
    },
    stay_type: null,
    issue_alert: values.notes.trim() || null,
    created_at: now,
    updated_at: now,
    unit_id: context.unit.id,
    property: context.property,
    guest: context.guest,
    financials: {
      accommodation: quote.accommodation,
      cleaning_fee: quote.cleaningFee,
      linen_fee: 0,
      management_fee: 0,
      resort_fee: 0,
      pet_fee: 0,
      pass_through_taxes: 0,
      other_fees: [],
      total: quote.total,
      currency: quote.currency,
    },
  };
}
