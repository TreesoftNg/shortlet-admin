import { ApiClientError } from '@/shared/api/types';
import { bookingErrorMessage, isMissingUnitPricingError } from './format';

describe('bookingErrorMessage', () => {
  it('maps date conflicts to a short nights-taken message', () => {
    expect(
      bookingErrorMessage(
        new ApiClientError('Those dates are no longer available. Please choose different dates.', {
          code: 'BOOKING_UNAVAILABLE',
          status: 409,
        }),
      ),
    ).toBe('Those nights are taken. Pick other dates.');
  });

  it('keeps the API text when pricing is missing', () => {
    const message =
      "Pricing hasn't been set up for this unit. Set a nightly rate to accept bookings.";
    expect(
      bookingErrorMessage(new ApiClientError(message, { code: 'BOOKING_UNAVAILABLE', status: 409 })),
    ).toBe(message);
  });

  it('keeps the API text when the unit is closed to bookings', () => {
    const message = 'This unit is not taking bookings right now.';
    expect(
      bookingErrorMessage(new ApiClientError(message, { code: 'BOOKING_UNAVAILABLE', status: 409 })),
    ).toBe(message);
  });
});

describe('isMissingUnitPricingError', () => {
  it('detects pricing-missing copy', () => {
    expect(
      isMissingUnitPricingError(
        new ApiClientError(
          "Pricing hasn't been set up for this unit. Set a nightly rate to accept bookings.",
          { code: 'BOOKING_UNAVAILABLE', status: 409 },
        ),
      ),
    ).toBe(true);
    expect(
      isMissingUnitPricingError(
        new ApiClientError('Those dates are no longer available.', {
          code: 'BOOKING_UNAVAILABLE',
          status: 409,
        }),
      ),
    ).toBe(false);
  });
});
