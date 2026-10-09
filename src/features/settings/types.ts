/** Row from GET /cc/tenant-settings — catalog key with effective value. */
export type TenantSettingItem = {
  key: string;
  category: string;
  label: string;
  description: string | null;
  valueType: 'boolean' | 'string';
  value: boolean | string;
  defaultValue: boolean | string;
};

/** Response data from GET/PUT /cc/tenant-settings. */
export type TenantSettingsResponse = {
  settings: TenantSettingItem[];
  updatedAt: string | null;
};

/** GET/PUT /cc/business-profile. */
export type BusinessProfile = {
  name: string;
  slug: string;
  supportEmail: string | null;
  supportPhone: string | null;
  whatsappPhone: string | null;
  address: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  xUrl: string | null;
  defaultCurrency: string;
  defaultTimezone: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  defaultHouseRules: string | null;
  updatedAt: string | null;
};

export type BusinessProfileInput = Omit<BusinessProfile, 'slug' | 'updatedAt'>;

/** GET/PUT /cc/pricing-settings (amounts as strings, sent as numbers). */
export type PricingSettings = {
  serviceFeePercent: string;
  taxName: string;
  taxPercent: string;
};

export type PricingSettingsInput = {
  serviceFeePercent: number;
  taxName: string;
  taxPercent: number;
};

/** GET/PUT /cc/booking-settings. */
export type BookingRules = {
  paymentHoldMinutes: number;
  staffLinkHoldHours: number;
  depositNights: number;
  longStayDepositNights: number;
  longStayMinNights: number;
  depositReleaseHours: number;
};

export type BookingSettings = BookingRules & { updatedAt: string | null };

/** GET /cc/payment-settings — never includes keys. */
export type PaymentSettings = {
  provider: 'flutterwave';
  configured: boolean;
  mode: 'test' | 'live' | null;
  webhookUrl: string;
  webhookSecretSet: boolean;
  lastWebhookAt: string | null;
};
