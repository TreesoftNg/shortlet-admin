import type { StatusTone } from '@/shared/components/ui';
import type { PaymentStatus, Reservation } from '@/shared/types/hospitable';

export type BookingDisplayStatus = {
  label: string;
  tone: StatusTone;
};

export function getReservationDisplayStatus(
  reservation: Reservation,
): BookingDisplayStatus {
  const { category, sub_category } = reservation.reservation_status.current;

  if (category === 'cancelled') {
    return { label: 'Cancelled', tone: 'danger' };
  }

  if (sub_category === 'request for payment') {
    return { label: 'Awaiting payment', tone: 'warn' };
  }

  if (sub_category === 'checked_in') {
    return { label: 'Checked in', tone: 'ok' };
  }

  if (sub_category === 'completed') {
    return { label: 'Completed', tone: 'mute' };
  }

  if (sub_category === 'external' || reservation.platform === 'airbnb') {
    return { label: 'External', tone: 'info' };
  }

  if (category === 'accepted') {
    return { label: 'Confirmed', tone: 'brand' };
  }

  return { label: category, tone: 'mute' };
}

export function canCheckInGuest(reservation: Reservation): boolean {
  const { category, sub_category } = reservation.reservation_status.current;

  if (category === 'cancelled' || sub_category === 'voided' || sub_category === 'refunded') {
    return false;
  }
  if (
    sub_category === 'checked_in' ||
    sub_category === 'completed' ||
    sub_category === 'request for payment'
  ) {
    return false;
  }

  return category === 'accepted' || sub_category === 'external';
}

export function canCancelBooking(reservation: Reservation): boolean {
  const { category, sub_category } = reservation.reservation_status.current;

  if (category === 'cancelled' || sub_category === 'voided' || sub_category === 'refunded') {
    return false;
  }
  if (sub_category === 'completed') {
    return false;
  }

  return true;
}

export function canRefundBooking(reservation: Reservation): boolean {
  const { category, sub_category } = reservation.reservation_status.current;

  if (category === 'cancelled' || sub_category === 'voided' || sub_category === 'refunded') {
    return false;
  }
  if (sub_category === 'request for payment') {
    return false;
  }
  if (reservation.platform === 'airbnb' || sub_category === 'external') {
    return false;
  }
  if (!reservation.financials || reservation.financials.total <= 0) {
    return false;
  }

  return category === 'accepted';
}

export function getPaymentDisplayStatus(
  reservation: Reservation,
): BookingDisplayStatus {
  const { category, sub_category } = reservation.reservation_status.current;

  if (category === 'cancelled') {
    return { label: 'Refunded', tone: 'danger' };
  }

  if (sub_category === 'request for payment') {
    return { label: 'Pending', tone: 'warn' };
  }

  if (sub_category === 'external') {
    return { label: 'External', tone: 'info' };
  }

  if (category === 'accepted') {
    return { label: 'Paid', tone: 'ok' };
  }

  return { label: 'Unknown', tone: 'mute' };
}

export function formatMoney(
  amount: number,
  currency = 'NGN',
  locale = 'en-NG',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStayDates(arrivalDate: string, departureDate: string): string {
  const start = new Date(`${arrivalDate}T00:00:00`);
  const end = new Date(`${departureDate}T00:00:00`);

  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });
  const endLabel = end.toLocaleDateString('en-GB', {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
  });

  return `${startLabel} – ${endLabel}`;
}

export function formatDateTimeLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatGuestsLabel(reservation: Reservation): string {
  const { adult_count, child_count, infant_count, pet_count } = reservation.guests;
  const parts: string[] = [];

  if (adult_count > 0) {
    parts.push(`${adult_count} adult${adult_count === 1 ? '' : 's'}`);
  }
  if (child_count > 0) {
    parts.push(`${child_count} child${child_count === 1 ? '' : 'ren'}`);
  }
  if (infant_count > 0) {
    parts.push(`${infant_count} infant${infant_count === 1 ? '' : 's'}`);
  }
  if (pet_count > 0) {
    parts.push(`${pet_count} pet${pet_count === 1 ? '' : 's'}`);
  }

  return parts.join(', ') || '—';
}

export function mapPaymentStatusTone(status: PaymentStatus): StatusTone {
  switch (status) {
    case 'SUCCESS':
      return 'ok';
    case 'PENDING':
    case 'INITIALIZED':
    case 'REFUND_PENDING':
      return 'warn';
    case 'FAILED':
    case 'CANCELLED':
    case 'REFUNDED':
      return 'danger';
    case 'PARTIALLY_REFUNDED':
      return 'info';
    default:
      return 'mute';
  }
}
