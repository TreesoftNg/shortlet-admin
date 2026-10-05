import { adminBooking } from '../test-fixtures';
import {
  canCancelBooking,
  canCheckInBooking,
  canReleaseDeposit,
  formatMoney,
  getBookingStatusDisplay,
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
});
