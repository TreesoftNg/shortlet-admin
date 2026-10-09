import { bookingSettings, businessProfile } from '../test-fixtures';
import {
  applyDepositSwitches,
  choicesWith,
  depositExampleStays,
  depositSwitches,
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
});

describe('choicesWith', () => {
  it('keeps a saved value that is not in the list', () => {
    expect(choicesWith(['NGN', 'USD'], 'NGN')).toEqual(['NGN', 'USD']);
    expect(choicesWith(['NGN', 'USD'], 'XOF')).toEqual(['XOF', 'NGN', 'USD']);
  });
});

describe('deposit switches', () => {
  const rules = bookingSettings();

  it('reads the switches from saved rules', () => {
    expect(depositSwitches(rules)).toEqual({ chargeDeposit: true, longStayDeposit: true });
    expect(depositSwitches({ ...rules, longStayDepositNights: 1 })).toEqual({ chargeDeposit: true, longStayDeposit: false });
    expect(depositSwitches({ ...rules, depositNights: 0, longStayDepositNights: 0 })).toEqual({
      chargeDeposit: false,
      longStayDeposit: false,
    });
    expect(depositSwitches({ ...rules, depositNights: 0 }).chargeDeposit).toBe(true);
  });

  it('applies the switches to the values to save', () => {
    const values = rulesToForm(rules);
    expect(applyDepositSwitches(values, { chargeDeposit: true, longStayDeposit: true })).toBe(values);
    expect(applyDepositSwitches(values, { chargeDeposit: true, longStayDeposit: false })).toMatchObject({
      depositNights: '1',
      longStayDepositNights: '1',
    });
    expect(applyDepositSwitches(values, { chargeDeposit: false, longStayDeposit: true })).toMatchObject({
      depositNights: '0',
      longStayDepositNights: '0',
      longStayMinNights: '15',
    });
  });

  it('picks example stay lengths around the long-stay threshold', () => {
    expect(depositExampleStays({ longStayMinNights: 15 })).toEqual({ short: 3, long: 15 });
    expect(depositExampleStays({ longStayMinNights: 3 })).toEqual({ short: 2, long: 3 });
    expect(depositExampleStays({ longStayMinNights: 2 })).toEqual({ short: 1, long: 2 });
  });
});
