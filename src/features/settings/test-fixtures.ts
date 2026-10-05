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
