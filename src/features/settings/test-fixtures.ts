import type { TenantSettingItem, TenantSettingsResponse } from './types';

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
      settingItem({
        key: 'contact.support_email',
        category: 'contact',
        label: 'Support email',
        description: 'Guests who reply to a booking email write to this address.',
        valueType: 'string',
        value: 'pauladesina117@gmail.com',
        defaultValue: '',
      }),
      settingItem({
        key: 'contact.support_phone',
        category: 'contact',
        label: 'Support phone',
        description: "Shown on confirmations when a property has no manager's number.",
        valueType: 'string',
        value: '09037019967',
        defaultValue: '',
      }),
      settingItem({
        key: 'contact.whatsapp',
        category: 'contact',
        label: 'WhatsApp',
        description: 'Used when there is no support phone.',
        valueType: 'string',
        value: '',
        defaultValue: '',
      }),
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
