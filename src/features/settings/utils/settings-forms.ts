import type { BookingRules, BusinessProfile, BusinessProfileInput, PricingSettings, PricingSettingsInput } from '../types';

/** Time zones offered in the picker (the API accepts any IANA zone). */
export const TIMEZONE_CHOICES = [
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Abidjan',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'Asia/Dubai',
  'UTC',
] as const;

export const CURRENCY_CHOICES = ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'GBP', 'EUR'] as const;

/** Select options that always include the saved value, even one outside the list. */
export function choicesWith(choices: readonly string[], value: string): string[] {
  return !value || choices.includes(value) ? [...choices] : [value, ...choices];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,24}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ProfileFormValues = Record<
  Exclude<keyof BusinessProfileInput, 'defaultHouseRules'>,
  string
> & { defaultHouseRules: string };
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function profileToForm(profile: BusinessProfile): ProfileFormValues {
  return {
    name: profile.name,
    supportEmail: profile.supportEmail ?? '',
    supportPhone: profile.supportPhone ?? '',
    whatsappPhone: profile.whatsappPhone ?? '',
    address: profile.address ?? '',
    websiteUrl: profile.websiteUrl ?? '',
    instagramUrl: profile.instagramUrl ?? '',
    facebookUrl: profile.facebookUrl ?? '',
    tiktokUrl: profile.tiktokUrl ?? '',
    xUrl: profile.xUrl ?? '',
    defaultCurrency: profile.defaultCurrency,
    defaultTimezone: profile.defaultTimezone,
    defaultCheckInTime: profile.defaultCheckInTime,
    defaultCheckOutTime: profile.defaultCheckOutTime,
    defaultHouseRules: profile.defaultHouseRules ?? '',
  };
}

/** Empty optional fields are sent as null, which clears them. */
export function formToProfileInput(values: ProfileFormValues): BusinessProfileInput {
  const optional = (value: string) => value.trim() || null;
  return {
    name: values.name.trim(),
    supportEmail: optional(values.supportEmail),
    supportPhone: optional(values.supportPhone),
    whatsappPhone: optional(values.whatsappPhone),
    address: optional(values.address),
    websiteUrl: optional(values.websiteUrl),
    instagramUrl: optional(values.instagramUrl),
    facebookUrl: optional(values.facebookUrl),
    tiktokUrl: optional(values.tiktokUrl),
    xUrl: optional(values.xUrl),
    defaultCurrency: values.defaultCurrency.trim().toUpperCase(),
    defaultTimezone: values.defaultTimezone,
    defaultCheckInTime: values.defaultCheckInTime,
    defaultCheckOutTime: values.defaultCheckOutTime,
    defaultHouseRules: optional(values.defaultHouseRules),
  };
}

function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateProfile(values: ProfileFormValues): FormErrors<ProfileFormValues> {
  const errors: FormErrors<ProfileFormValues> = {};
  const name = values.name.trim();
  if (name.length < 2 || name.length > 150) errors.name = 'Enter the business name (2–150 characters).';
  if (values.supportEmail.trim() && !EMAIL_PATTERN.test(values.supportEmail.trim())) {
    errors.supportEmail = 'Enter a valid email address.';
  }
  for (const field of ['supportPhone', 'whatsappPhone'] as const) {
    if (values[field].trim() && !PHONE_PATTERN.test(values[field].trim())) errors[field] = 'Enter a valid phone number.';
  }
  for (const field of ['websiteUrl', 'instagramUrl', 'facebookUrl', 'tiktokUrl', 'xUrl'] as const) {
    if (values[field].trim() && !isWebAddress(values[field].trim())) {
      errors[field] = 'Enter a full web address starting with https://';
    }
  }
  if (!/^[A-Za-z]{3}$/.test(values.defaultCurrency.trim())) errors.defaultCurrency = 'Use a 3-letter code such as NGN.';
  if (!values.defaultTimezone) errors.defaultTimezone = 'Choose a time zone.';
  if (!TIME_PATTERN.test(values.defaultCheckInTime)) errors.defaultCheckInTime = 'Use HH:mm, e.g. 15:00.';
  if (!TIME_PATTERN.test(values.defaultCheckOutTime)) errors.defaultCheckOutTime = 'Use HH:mm, e.g. 11:00.';
  if (values.defaultHouseRules.length > 5000) errors.defaultHouseRules = 'Keep house rules under 5,000 characters.';
  return errors;
}

export type PricingFormValues = { serviceFeePercent: string; taxName: string; taxPercent: string };

export function pricingToForm(settings: PricingSettings): PricingFormValues {
  return {
    serviceFeePercent: String(Number(settings.serviceFeePercent)),
    taxName: settings.taxName,
    taxPercent: String(Number(settings.taxPercent)),
  };
}

const isPercent = (value: string) => {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;
  const number = Number(value);
  return number >= 0 && number <= 100;
};

export function validatePricing(values: PricingFormValues): FormErrors<PricingFormValues> {
  const errors: FormErrors<PricingFormValues> = {};
  if (!isPercent(values.serviceFeePercent)) errors.serviceFeePercent = 'Enter 0–100, up to 2 decimals.';
  if (!isPercent(values.taxPercent)) errors.taxPercent = 'Enter 0–100, up to 2 decimals.';
  const taxName = values.taxName.trim();
  if (!taxName || taxName.length > 40) errors.taxName = 'Enter the tax name (up to 40 characters).';
  return errors;
}

export function formToPricingInput(values: PricingFormValues): PricingSettingsInput {
  return {
    serviceFeePercent: Number(values.serviceFeePercent),
    taxName: values.taxName.trim(),
    taxPercent: Number(values.taxPercent),
  };
}

/**
 * What a guest pays for a sample stay, worked out like the API: service fee
 * on the nights, tax on nights + cleaning + service fee. Amounts in kobo.
 */
export function pricingExample(
  values: PricingFormValues,
  nightsKobo = 10_000_000,
  cleaningKobo = 1_000_000,
): { serviceFee: number; tax: number; total: number } | null {
  if (Object.keys(validatePricing(values)).length) return null;
  const percentOf = (amount: number, percent: string) => Math.floor((amount * Math.round(Number(percent) * 100) + 5_000) / 10_000);
  const serviceFee = percentOf(nightsKobo, values.serviceFeePercent);
  const tax = percentOf(nightsKobo + cleaningKobo + serviceFee, values.taxPercent);
  return { serviceFee, tax, total: nightsKobo + cleaningKobo + serviceFee + tax };
}

export type RulesFormValues = Record<keyof BookingRules, string>;

export const RULE_LIMITS: Record<keyof BookingRules, { min: number; max: number }> = {
  paymentHoldMinutes: { min: 5, max: 60 },
  staffLinkHoldHours: { min: 1, max: 24 },
  depositNights: { min: 0, max: 7 },
  longStayDepositNights: { min: 0, max: 14 },
  longStayMinNights: { min: 2, max: 366 },
  depositReleaseHours: { min: 1, max: 168 },
};

export function rulesToForm(rules: BookingRules): RulesFormValues {
  return Object.fromEntries(
    (Object.keys(RULE_LIMITS) as Array<keyof BookingRules>).map((key) => [key, String(rules[key])]),
  ) as RulesFormValues;
}

export function validateRules(values: RulesFormValues): FormErrors<RulesFormValues> {
  const errors: FormErrors<RulesFormValues> = {};
  for (const [key, { min, max }] of Object.entries(RULE_LIMITS) as Array<[keyof BookingRules, { min: number; max: number }]>) {
    const value = values[key].trim();
    if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
      errors[key] = `Enter a whole number from ${min} to ${max}.`;
    }
  }
  return errors;
}

export function formToRules(values: RulesFormValues): BookingRules {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])) as BookingRules;
}

/** The two switches on the deposit section, worked out from saved rules. */
export type DepositSwitches = { chargeDeposit: boolean; longStayDeposit: boolean };

export function depositSwitches(rules: BookingRules): DepositSwitches {
  return {
    chargeDeposit: rules.depositNights > 0 || rules.longStayDepositNights > 0,
    longStayDeposit: rules.longStayDepositNights !== rules.depositNights,
  };
}

/**
 * The form values to save once the switches are applied: no deposit clears both
 * deposits, and without a long-stay deposit long stays pay the usual one.
 */
export function applyDepositSwitches(values: RulesFormValues, switches: DepositSwitches): RulesFormValues {
  if (!switches.chargeDeposit) return { ...values, depositNights: '0', longStayDepositNights: '0' };
  if (!switches.longStayDeposit) return { ...values, longStayDepositNights: values.depositNights };
  return values;
}

/** Stay lengths for the deposit example: a short stay and the first long one. */
export function depositExampleStays(rules: Pick<BookingRules, 'longStayMinNights'>): { short: number; long: number } {
  return { short: Math.max(1, Math.min(3, rules.longStayMinNights - 1)), long: rules.longStayMinNights };
}
