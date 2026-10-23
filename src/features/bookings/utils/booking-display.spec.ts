import { adminBooking } from '../test-fixtures';
import {
  canCancelBooking,
  canCheckInBooking,
  canReleaseDeposit,
  depositRefundedLabel,
  depositReturnableBalance,
  formatCancelledBy,
  formatMoney,
  formatRefundReason,
  getBookingStatusDisplay,
  getPaymentStatusDisplay,
  getRefundStatusDisplay,
  paymentRefundableBalance,
  refundBreakdownLabel,
  refundProgressLabel,
  stayRefundableBalance,
} from './booking-display';

describe('booking-display', () => {
  it('formats string money amounts', () => {
    expect(formatMoney('250000.00', 'NGN')).toContain('250');
  });

  it('maps booking statuses', () => {
    expect(getBookingStatusDisplay('pending_payment')).toEqual({
      label: 'Awaiting payment',
      tone: 'warn',
    });
    expect(getBookingStatusDisplay('checked_in')).toEqual({
      label: 'Checked in',
      tone: 'ok',
    });
  });

  it('gates check-in, cancel, and deposit release', () => {
    const confirmed = adminBooking({ status: 'confirmed' });
    expect(canCheckInBooking(confirmed)).toBe(true);
    expect(canCancelBooking(confirmed)).toBe(true);
    expect(canReleaseDeposit(confirmed)).toBe(true);

    const completed = adminBooking({
      status: 'completed',
      deposit: { ...confirmed.deposit, status: 'held' },
    });
    expect(canCheckInBooking(completed)).toBe(false);
    expect(canCancelBooking(completed)).toBe(false);
    expect(canReleaseDeposit(completed)).toBe(true);
  });

  it('computes stay refundable balance', () => {
    expect(
      stayRefundableBalance(
        adminBooking({ stayTotal: '100.00', stayRefunded: '25.50' }),
      ),
    ).toBe(74.5);
  });

  describe('who cancelled', () => {
    it.each([
      [{ cancelledBy: 'guest', cancelledByUser: null }, 'Guest'],
      [{ cancelledBy: 'system', cancelledByUser: null }, 'Automatically (payment issue)'],
      [
        {
          cancelledBy: 'staff',
          cancelledByUser: { id: 'u1', name: 'Temitope Aladesiun', role: 'owner' },
        },
        'Owner · Temitope Aladesiun',
      ],
      [
        { cancelledBy: 'staff', cancelledByUser: { id: null, name: null, role: 'manager' } },
        'Manager',
      ],
      // Cancelled before the role was recorded.
      [{ cancelledBy: 'staff', cancelledByUser: null }, 'Staff'],
      [{ cancelledBy: null, cancelledByUser: null }, '—'],
    ] as const)('%j reads %s', (booking, label) => {
      expect(formatCancelledBy(booking)).toBe(label);
    });
  });

  describe('refunds', () => {
    it('labels a part-refunded payment the same everywhere', () => {
      expect(getPaymentStatusDisplay('partially_refunded')).toEqual({
        label: 'Partly refunded',
        tone: 'info',
      });
    });

    it('labels needs_review and pending refunds checking with the provider', () => {
      expect(getPaymentStatusDisplay('needs_review')).toEqual({
        label: 'Needs review',
        tone: 'warn',
      });
      expect(getRefundStatusDisplay('pending', true)).toEqual({
        label: 'Checking with provider',
        tone: 'warn',
      });
    });

    it('uses amountReceived for needs_review refundable balance', () => {
      expect(
        paymentRefundableBalance({
          amount: '222000.00',
          amountReceived: '300000.00',
          amountRefunded: '0.00',
          status: 'needs_review',
        }),
      ).toBe(300000);
      expect(
        paymentRefundableBalance({
          amount: '222000.00',
          amountReceived: null,
          amountRefunded: '0.00',
          status: 'successful',
        }),
      ).toBe(222000);
    });

    it('says how much of a payment was refunded', () => {
      expect(
        refundProgressLabel({
          amount: '429750.00',
          amountRefunded: '354750.00',
          currency: 'NGN',
        }),
      ).toBe('₦354,750 of ₦429,750 refunded');
      expect(
        refundProgressLabel({ amount: '1000.00', amountRefunded: '0.00', currency: 'NGN' }),
      ).toBeNull();
    });

    it('splits the refunded total into stay and deposit', () => {
      expect(
        refundBreakdownLabel(
          adminBooking({
            stayRefunded: '250000.00',
            deposit: { ...adminBooking().deposit, status: 'refunded', refunded: '70000.00' },
          }),
        ),
      ).toBe('Stay ₦250,000 · Deposit ₦70,000');
    });

    it('says a held deposit is not returned yet instead of ₦0', () => {
      expect(depositRefundedLabel(adminBooking())).toBe('Not returned yet');
      expect(
        depositRefundedLabel(
          adminBooking({
            deposit: { ...adminBooking().deposit, status: 'refunded', refunded: '70000.00' },
          }),
        ),
      ).toBe('₦70,000');
      expect(
        depositRefundedLabel(
          adminBooking({ deposit: { ...adminBooking().deposit, status: 'pending' } }),
        ),
      ).toBe('—');
    });

    it('only offers back a deposit that is still held', () => {
      expect(depositReturnableBalance(adminBooking())).toBe(70000);
      expect(
        depositReturnableBalance(
          adminBooking({ deposit: { ...adminBooking().deposit, status: 'refunded' } }),
        ),
      ).toBe(0);
    });

    it('uses the same words as the refund reasons list', () => {
      expect(formatRefundReason('host_cancellation')).toBe('Host cancellation');
      expect(formatRefundReason('deposit_release')).toBe('Deposit returned');
      expect(formatRefundReason('other')).toBe('Other');
    });
  });
});
