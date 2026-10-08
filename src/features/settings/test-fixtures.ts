import type {
  BookingSettings,
  BusinessProfile,
  PaymentSettings,
  PricingSettings,
  TenantSettingItem,
  TenantSettingsResponse,
} from './types';

export function settingItem(
  overrides: Partial<TenantSettingItem> = {},
): TenantSettingItem {
  return {
    key: 'email.booking_created',
    category: 'notifications',
    label: 'New bookings',
    description: 'Email staff when a guest books a stay.',
    valueType: 'boolean',
    value: true,
    defaultValue: true,
    ...overrides,
  };
}

export function settingsResponse(
  overrides: Partial<TenantSettingsResponse> = {},
): TenantSettingsResponse {
  return {
    settings: [
      settingItem(),
      settingItem({
        key: 'email.payment_failed',
        label: 'Failed payments',
        value: true,
      }),
      settingItem({
        key: 'email.review_submitted',
        label: 'New reviews',
        value: false,
        defaultValue: true,
      }),
    ],
    updatedAt: '2026-09-26T16:00:00Z',
    ...overrides,
  };
}

export function businessProfile(overrides: Partial<BusinessProfile> = {}): BusinessProfile {
  return {
    name: 'Sunmade',
    slug: 'sunmade',
    supportEmail: null,
    supportPhone: null,
    whatsappPhone: null,
    address: null,
    websiteUrl: null,
    instagramUrl: null,
    facebookUrl: null,
    tiktokUrl: null,
    xUrl: null,
    defaultCurrency: 'NGN',
    defaultTimezone: 'Africa/Lagos',
    defaultCheckInTime: '15:00',
    defaultCheckOutTime: '11:00',
    defaultHouseRules: 'No parties.',
    updatedAt: '2026-10-01T09:00:00Z',
    ...overrides,
  };
}

export function pricingSettings(overrides: Partial<PricingSettings> = {}): PricingSettings {
  return { serviceFeePercent: '10.00', taxName: 'VAT', taxPercent: '7.50', ...overrides };
}

export function bookingSettings(overrides: Partial<BookingSettings> = {}): BookingSettings {
  return {
    paymentHoldMinutes: 15,
    staffLinkHoldHours: 24,
    depositNights: 1,
    longStayDepositNights: 2,
    longStayMinNights: 15,
    depositReleaseHours: 24,
    updatedAt: null,
    ...overrides,
  };
}

export function paymentSettings(overrides: Partial<PaymentSettings> = {}): PaymentSettings {
  return {
    provider: 'flutterwave',
    configured: true,
    mode: 'test',
    webhookUrl: 'https://api.example.com/api/v1/webhooks/payments/flutterwave',
    webhookSecretSet: true,
    lastWebhookAt: null,
    ...overrides,
  };
}
