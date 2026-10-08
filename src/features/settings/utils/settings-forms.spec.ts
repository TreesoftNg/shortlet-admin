import { bookingSettings, businessProfile } from '../test-fixtures';
import {
  choicesWith,
  describeDepositRule,
  formToProfileInput,
  formToRules,
  pricingExample,
  profileToForm,
  rulesToForm,
  validatePricing,
  validateProfile,
  validateRules,
} from './settings-forms';

describe('business profile form', () => {
  it('round-trips the profile, sending blank optional fields as null', () => {
    const values = profileToForm(businessProfile({ supportEmail: 'hello@sunmade.ng' }));
    expect(values.supportPhone).toBe('');
    expect(formToProfileInput({ ...values, defaultCurrency: ' ngn ', defaultHouseRules: '  ' })).toEqual(
      expect.objectContaining({
        name: 'Sunmade',
        supportEmail: 'hello@sunmade.ng',
        supportPhone: null,
        defaultCurrency: 'NGN',
        defaultHouseRules: null,
      }),
    );
  });

  it('accepts a valid profile', () => {
    const values = {
      ...profileToForm(businessProfile()),
      supportEmail: 'hello@sunmade.ng',
      supportPhone: '+234 706 830 7978',
      websiteUrl: 'https://sunmade.ng',
    };
    expect(validateProfile(values)).toEqual({});
  });

  it('flags bad fields', () => {
    const errors = validateProfile({
      ...profileToForm(businessProfile()),
      name: 'S',
      supportEmail: 'not-an-email',
      whatsappPhone: 'call me',
      instagramUrl: 'instagram.com/sunmade',
      defaultCurrency: 'NAIRA',
      defaultCheckInTime: '25:00',
    });
    expect(Object.keys(errors).sort()).toEqual(
      ['defaultCheckInTime', 'defaultCurrency', 'instagramUrl', 'name', 'supportEmail', 'whatsappPhone'].sort(),
    );
  });
});

describe('pricing form', () => {
  it('rejects out-of-range or over-precise percentages and a blank tax name', () => {
    expect(validatePricing({ serviceFeePercent: '101', taxName: ' ', taxPercent: '7.555' })).toEqual({
      serviceFeePercent: expect.any(String),
      taxName: expect.any(String),
      taxPercent: expect.any(String),
    });
  });

  it('works out the example like the API (fee on nights, tax on nights + cleaning + fee)', () => {
    // ₦100,000 nights + ₦10,000 cleaning, 10% fee, 7.5% VAT.
    expect(pricingExample({ serviceFeePercent: '10', taxName: 'VAT', taxPercent: '7.5' })).toEqual({
      serviceFee: 1_000_000,
      tax: 900_000,
      total: 12_900_000,
    });
    expect(pricingExample({ serviceFeePercent: 'x', taxName: 'VAT', taxPercent: '7.5' })).toBeNull();
  });
});

describe('booking rules form', () => {
  it('round-trips and validates whole numbers within limits', () => {
    const values = rulesToForm(bookingSettings());
    expect(validateRules(values)).toEqual({});
    expect(formToRules(values)).toEqual({
      paymentHoldMinutes: 15,
      staffLinkHoldHours: 24,
      depositNights: 1,
      longStayDepositNights: 2,
      longStayMinNights: 15,
      depositReleaseHours: 24,
    });
    expect(validateRules({ ...values, paymentHoldMinutes: '4', staffLinkHoldHours: '25', depositNights: '1.5' })).toEqual({
      paymentHoldMinutes: 'Enter a whole number from 5 to 60.',
      staffLinkHoldHours: 'Enter a whole number from 1 to 24.',
      depositNights: 'Enter a whole number from 0 to 7.',
    });
  });

  it('describes the deposit rule', () => {
    expect(describeDepositRule({ depositNights: 1, longStayDepositNights: 2, longStayMinNights: 15 })).toBe(
      '1 night at the base rate, or 2 nights for stays of 15+ nights',
    );
    expect(describeDepositRule({ depositNights: 2, longStayDepositNights: 2, longStayMinNights: 15 })).toBe(
      '2 nights at the base rate',
    );
    expect(describeDepositRule({ depositNights: 0, longStayDepositNights: 1, longStayMinNights: 30 })).toBe(
      'No deposit, or 1 night for stays of 30+ nights',
    );
  });
});

describe('choicesWith', () => {
  it('keeps a saved value that is not in the list', () => {
    expect(choicesWith(['NGN', 'USD'], 'NGN')).toEqual(['NGN', 'USD']);
    expect(choicesWith(['NGN', 'USD'], 'XOF')).toEqual(['XOF', 'NGN', 'USD']);
  });
});
