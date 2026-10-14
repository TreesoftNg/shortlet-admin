import { adminBooking, paymentView, refundView } from '../test-fixtures';
import {
  buildCancelInput,
  cancelFormDefaults,
  cancelRefundOptions,
  cancelRefundTotal,
  newFailedRefunds,
} from './cancel-booking';

describe('cancel-booking', () => {
  const booking = adminBooking();

  it('offers the stay left and the held deposit to someone with refund access', () => {
    expect(cancelRefundOptions(booking, true)).toEqual({
      stayLeft: 250000,
      depositLeft: 70000,
      canRefundStay: true,
      canReturnDeposit: true,
    });
    expect(cancelRefundOptions(booking, false)).toMatchObject({
      canRefundStay: false,
      canReturnDeposit: false,
    });
  });

  it('offers nothing when nothing was paid', () => {
    const unpaid = adminBooking({
      status: 'pending_payment',
      payments: [paymentView({ status: 'initialized' })],
    });
    expect(cancelRefundOptions(unpaid, true)).toMatchObject({
      canRefundStay: false,
      canReturnDeposit: false,
    });
  });

  it('defaults to a full refund, keeping the deposit of a checked-in guest', () => {
    const options = cancelRefundOptions(booking, true);
    expect(cancelFormDefaults(booking, options)).toMatchObject({
      stayRefund: '250000',
      returnDeposit: true,
    });
    const checkedIn = adminBooking({ status: 'checked_in' });
    expect(
      cancelFormDefaults(checkedIn, cancelRefundOptions(checkedIn, true))
        .returnDeposit,
    ).toBe(false);
  });

  it('adds up what goes back to the guest', () => {
    const options = cancelRefundOptions(booking, true);
    const values = cancelFormDefaults(booking, options);
    expect(cancelRefundTotal(values, options)).toBe(320000);
    expect(
      cancelRefundTotal(
        { ...values, stayRefund: '1000.5', returnDeposit: false },
        options,
      ),
    ).toBe(1000.5);
  });

  it('builds the request body, leaving out refunds that are not asked for', () => {
    const options = cancelRefundOptions(booking, true);
    const values = {
      ...cancelFormDefaults(booking, options),
      reason: '  Water outage ',
    };
    expect(buildCancelInput(values, options, 'NGN')).toEqual({
      input: {
        reason: 'Water outage',
        stayRefund: 250000,
        refundReason: 'guest_cancellation',
        returnDeposit: true,
      },
    });
    expect(
      buildCancelInput(
        { ...values, stayRefund: '0', returnDeposit: false },
        options,
        'NGN',
      ),
    ).toEqual({ input: { reason: 'Water outage' } });
  });

  it('reports a missing reason and an amount out of range', () => {
    const options = cancelRefundOptions(booking, true);
    const result = buildCancelInput(
      { ...cancelFormDefaults(booking, options), stayRefund: '250000.01' },
      options,
      'NGN',
    );
    expect(result).toEqual({
      errors: {
        reason: 'Say why this booking is being cancelled.',
        stayRefund: 'Enter an amount from ₦0 to ₦250,000.',
      },
    });
  });

  it('finds refunds that failed during this cancellation only', () => {
    const before = adminBooking({
      refunds: [refundView({ id: 'old', status: 'failed' })],
    });
    const after = adminBooking({
      refunds: [
        refundView({ id: 'old', status: 'failed' }),
        refundView({ id: 'new-ok', status: 'completed' }),
        refundView({ id: 'new-failed', status: 'failed' }),
      ],
    });
    expect(newFailedRefunds(before, after).map((refund) => refund.id)).toEqual([
      'new-failed',
    ]);
  });
});
