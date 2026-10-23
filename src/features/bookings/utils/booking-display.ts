import type { StatusTone } from '@/shared/components/ui';
import type {
  AdminBooking,
  BookingListItem,
  BookingStatus,
  DepositStatus,
  PaymentStatus,
  RefundKind,
  RefundReason,
  RefundStatus,
  StaffRoleCode,
} from '../types';

export type DisplayChip = { label: string; tone: StatusTone };

export function formatMoney(
  amount: number | string,
  currency = 'NGN',
  locale = 'en-NG',
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStayDates(checkIn: string, checkOut: string): string {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
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
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getBookingStatusDisplay(status: BookingStatus): DisplayChip {
  switch (status) {
    case 'pending_payment':
      return { label: 'Awaiting payment', tone: 'warn' };
    case 'confirmed':
      return { label: 'Confirmed', tone: 'brand' };
    case 'checked_in':
      return { label: 'Checked in', tone: 'ok' };
    case 'completed':
      return { label: 'Completed', tone: 'mute' };
    case 'cancelled':
      return { label: 'Cancelled', tone: 'danger' };
    case 'expired':
      return { label: 'Expired', tone: 'mute' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function getDepositStatusDisplay(status: DepositStatus): DisplayChip {
  switch (status) {
    case 'pending':
      return { label: 'Deposit pending', tone: 'warn' };
    case 'held':
      return { label: 'Deposit held', tone: 'info' };
    case 'refunded':
      return { label: 'Deposit refunded', tone: 'ok' };
    case 'partially_refunded':
      return { label: 'Deposit partial', tone: 'info' };
    case 'retained':
      return { label: 'Deposit retained', tone: 'danger' };
    case 'none':
      return { label: 'No deposit', tone: 'mute' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function getPaymentStatusDisplay(status: PaymentStatus): DisplayChip {
  switch (status) {
    case 'initialized':
      return { label: 'Initialized', tone: 'warn' };
    case 'successful':
      return { label: 'Successful', tone: 'ok' };
    case 'failed':
      return { label: 'Failed', tone: 'danger' };
    case 'abandoned':
      return { label: 'Abandoned', tone: 'mute' };
    case 'needs_review':
      return { label: 'Needs review', tone: 'warn' };
    case 'partially_refunded':
      return { label: 'Partly refunded', tone: 'info' };
    case 'refunded':
      return { label: 'Refunded', tone: 'danger' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function getRefundStatusDisplay(
  status: RefundStatus,
  awaitingProvider = false,
): DisplayChip {
  switch (status) {
    case 'pending':
      return {
        label: awaitingProvider ? 'Checking with provider' : 'Pending',
        tone: 'warn',
      };
    case 'completed':
      return { label: 'Completed', tone: 'ok' };
    case 'failed':
      return { label: 'Failed', tone: 'danger' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function formatRefundKind(kind: RefundKind): string {
  switch (kind) {
    case 'stay':
      return 'Stay';
    case 'deposit':
      return 'Deposit';
    case 'payment':
      return 'Automatic';
    default:
      return kind;
  }
}

const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  guest_cancellation: 'Guest cancellation',
  host_cancellation: 'Host cancellation',
  partial_stay: 'Partial stay',
  service_issue: 'Service issue',
  duplicate_charge: 'Duplicate charge',
  unavailable_after_payment: 'Dates taken before payment',
  deposit_release: 'Deposit returned',
  other: 'Other',
};

export function formatRefundReason(reason: RefundReason): string {
  return REFUND_REASON_LABELS[reason] ?? reason.replace(/_/g, ' ');
}

/** "₦354,750 of ₦429,750 refunded"; null when nothing was refunded. */
export function refundProgressLabel(payment: {
  amount: string;
  amountRefunded: string;
  currency: string;
}): string | null {
  const refunded = Number(payment.amountRefunded);
  if (!Number.isFinite(refunded) || refunded <= 0) return null;
  return `${formatMoney(refunded, payment.currency)} of ${formatMoney(payment.amount, payment.currency)} refunded`;
}

/** What makes up the refunded total, e.g. "Stay ₦354,750 · Deposit ₦75,000". */
export function refundBreakdownLabel(booking: AdminBooking): string {
  return `Stay ${formatMoney(booking.stayRefunded, booking.currency)} · Deposit ${formatMoney(booking.deposit.refunded, booking.currency)}`;
}

/** A held deposit has not been returned yet, which says more than "₦0". */
export function depositRefundedLabel(booking: AdminBooking): string {
  if (booking.deposit.status === 'held') return 'Not returned yet';
  if (booking.deposit.status === 'pending' || booking.deposit.status === 'none')
    return '—';
  return formatMoney(booking.deposit.refunded, booking.currency);
}

const ROLE_LABELS: Record<StaffRoleCode, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
};

/** Who cancelled: "Owner · Ada Obi", "Guest", or "Automatically (payment issue)". */
export function formatCancelledBy(
  booking: Pick<AdminBooking, 'cancelledBy' | 'cancelledByUser'>,
): string {
  switch (booking.cancelledBy) {
    case 'guest':
      return 'Guest';
    case 'system':
      return 'Automatically (payment issue)';
    case 'staff': {
      const user = booking.cancelledByUser;
      const role = user?.role ? ROLE_LABELS[user.role] : 'Staff';
      return user?.name ? `${role} · ${user.name}` : role;
    }
    default:
      return '—';
  }
}

export function guestFullName(booking: AdminBooking): string {
  return `${booking.guest.firstName} ${booking.guest.lastName}`.trim();
}

export function formatGuestsLabel(booking: AdminBooking): string {
  const { adults, children, infants } = booking.guests;
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children > 0) {
    parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  }
  if (infants > 0) {
    parts.push(`${infants} infant${infants === 1 ? '' : 's'}`);
  }
  return parts.join(', ') || '—';
}

export function unitLabel(item: BookingListItem | AdminBooking): string {
  const unit = item.unit;
  const name = unit.publicName?.trim() || unit.name;
  const property = unit.propertyName?.trim();
  return property ? `${property} · ${name}` : name;
}

export function canCheckInBooking(booking: AdminBooking): boolean {
  return booking.status === 'confirmed';
}

export function canCancelBooking(booking: AdminBooking): boolean {
  return (
    booking.status === 'pending_payment' ||
    booking.status === 'confirmed' ||
    booking.status === 'checked_in'
  );
}

export function canReleaseDeposit(booking: AdminBooking): boolean {
  return booking.deposit.status === 'held';
}

/** Deposit still held that can be returned (0 when none is held). */
export function depositReturnableBalance(booking: AdminBooking): number {
  if (booking.deposit.status !== 'held') return 0;
  const amount = Number(booking.deposit.amount);
  const refunded = Number(booking.deposit.refunded);
  if (!Number.isFinite(amount) || !Number.isFinite(refunded)) return 0;
  return Math.max(0, Math.round((amount - refunded) * 100) / 100);
}

export function stayRefundableBalance(booking: AdminBooking): number {
  const stay = Number(booking.stayTotal);
  const refunded = Number(booking.stayRefunded);
  if (!Number.isFinite(stay) || !Number.isFinite(refunded)) return 0;
  return Math.max(0, Math.round((stay - refunded) * 100) / 100);
}

export function confirmingPayment(booking: AdminBooking) {
  return (
    booking.payments.find(
      (payment) =>
        payment.status === 'successful' ||
        payment.status === 'partially_refunded',
    ) ?? null
  );
}

/** Payment staff can refund (confirming stay, or needs_review mismatch). */
export function refundablePayment(booking: AdminBooking) {
  return (
    booking.payments.find(
      (payment) =>
        payment.status === 'successful' ||
        payment.status === 'partially_refunded' ||
        payment.status === 'needs_review',
    ) ?? null
  );
}

/**
 * Balance left on a payment row. For needs_review, use amountReceived
 * (what the provider charged) when present so overpay can be returned.
 */
export function paymentRefundableBalance(payment: {
  amount: string;
  amountRefunded: string;
  amountReceived?: string | null;
  status?: string;
}): number {
  const charged =
    payment.status === 'needs_review' && payment.amountReceived
      ? Number(payment.amountReceived)
      : Number(payment.amount);
  const refunded = Number(payment.amountRefunded);
  if (!Number.isFinite(charged) || !Number.isFinite(refunded)) return 0;
  return Math.max(0, Math.round((charged - refunded) * 100) / 100);
}

export function timelineTitle(event: string): string {
  const labels: Record<string, string> = {
    reserved: 'Booking created',
    confirmed: 'Payment confirmed',
    checked_in: 'Guest checked in',
    completed: 'Stay completed',
    cancelled: 'Booking cancelled',
    expired: 'Hold expired',
    deposit_settled: 'Deposit settled',
    refund_created: 'Refund created',
  };
  return labels[event] ?? event.replace(/_/g, ' ');
}
