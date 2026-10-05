import {
  countEnabledNotifications,
  formatSettingsUpdatedAt,
  settingsValuesMap,
} from './settings-helpers';
import type { TenantSettingItem } from '../types';

const sample: TenantSettingItem[] = [
  {
    key: 'email.booking_created',
    category: 'notifications',
    label: 'New bookings',
    description: null,
    valueType: 'boolean',
    value: true,
    defaultValue: true,
  },
  {
    key: 'email.payment_failed',
    category: 'notifications',
    label: 'Failed payments',
    description: null,
    valueType: 'boolean',
    value: false,
    defaultValue: true,
  },
];

describe('settings-helpers', () => {
  it('counts enabled notifications', () => {
    expect(countEnabledNotifications(sample)).toBe(1);
  });

  it('formats updated timestamp and never', () => {
    expect(formatSettingsUpdatedAt(null)).toBe('never');
    expect(formatSettingsUpdatedAt('2026-09-26T16:00:00Z')).toContain('2026');
  });

  it('maps settings to a values object for save', () => {
    expect(settingsValuesMap(sample)).toEqual({
      'email.booking_created': true,
      'email.payment_failed': false,
    });
  });
});
