import type {
  AdminBooking,
  CancelBookingInput,
  StaffRefundReason,
} from '../types';
import {
  confirmingPayment,
  depositReturnableBalance,
  formatMoney,
  stayRefundableBalance,
} from './booking-display';

export type CancelFormValues = {
  reason: string;
  /** As typed; parsed on submit. */
  stayRefund: string;
  refundReason: StaffRefundReason;
  returnDeposit: boolean;
};

export type CancelFormErrors = Partial<
  Record<'reason' | 'stayRefund', string>
>;

/** What can be refunded while cancelling, for someone with or without refund access. */
export type CancelRefundOptions = {
  stayLeft: number;
  depositLeft: number;
  canRefundStay: boolean;
  canReturnDeposit: boolean;
};

export function cancelRefundOptions(
  booking: AdminBooking,
  canRefund: boolean,
): CancelRefundOptions {
  const paid = canRefund && Boolean(confirmingPayment(booking));
  const stayLeft = stayRefundableBalance(booking);
  const depositLeft = depositReturnableBalance(booking);
  return {
    stayLeft,
    depositLeft,
    canRefundStay: paid && stayLeft > 0,
    canReturnDeposit: paid && depositLeft > 0,
  };
}

/**
 * Refund the whole stay left and return the deposit, except for a guest who
 * is already checked in: their apartment should be inspected first.
 */
export function cancelFormDefaults(
  booking: AdminBooking,
  options: CancelRefundOptions,
): CancelFormValues {
  return {
    reason: '',
    stayRefund: options.canRefundStay ? String(options.stayLeft) : '0',
    refundReason: 'guest_cancellation',
    returnDeposit:
      options.canReturnDeposit && booking.status !== 'checked_in',
  };
}

function parseAmount(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? 0 : Number(trimmed);
}

/** How much goes back to the guest with these choices. */
export function cancelRefundTotal(
  values: CancelFormValues,
  options: CancelRefundOptions,
): number {
  const stay = options.canRefundStay ? parseAmount(values.stayRefund) : 0;
  const deposit =
    options.canReturnDeposit && values.returnDeposit ? options.depositLeft : 0;
  const total = (Number.isFinite(stay) ? stay : 0) + deposit;
  return Math.round(total * 100) / 100;
}

export function buildCancelInput(
  values: CancelFormValues,
  options: CancelRefundOptions,
  currency: string,
): { input: CancelBookingInput } | { errors: CancelFormErrors } {
  const errors: CancelFormErrors = {};
  const reason = values.reason.trim();
  if (!reason) errors.reason = 'Say why this booking is being cancelled.';

  const stay = options.canRefundStay ? parseAmount(values.stayRefund) : 0;
  if (!Number.isFinite(stay) || stay < 0 || stay > options.stayLeft) {
    errors.stayRefund = `Enter an amount from ${formatMoney(0, currency)} to ${formatMoney(options.stayLeft, currency)}.`;
  }
  if (Object.keys(errors).length) return { errors };

  const input: CancelBookingInput = { reason };
  if (stay > 0) {
    input.stayRefund = Math.round(stay * 100) / 100;
    input.refundReason = values.refundReason;
  }
  if (options.canReturnDeposit && values.returnDeposit) {
    input.returnDeposit = true;
  }
  return { input };
}

/** Refunds in the cancel response that failed and were not there before. */
export function newFailedRefunds(before: AdminBooking, after: AdminBooking) {
  const known = new Set(before.refunds.map((refund) => refund.id));
  return after.refunds.filter(
    (refund) => refund.status === 'failed' && !known.has(refund.id),
  );
}
