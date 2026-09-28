import {
  countEnabledNotifications,
  formatSettingsUpdatedAt,
  NOTIFICATION_OPTIONS,
} from './settings-helpers';
import { mockTenantSettings } from '@/mocks/data/settings';

describe('settings-helpers', () => {
  it('lists notification options', () => {
    expect(NOTIFICATION_OPTIONS.length).toBe(6);
  });

  it('counts enabled notifications', () => {
    expect(
      countEnabledNotifications(mockTenantSettings.notifications),
    ).toBeGreaterThan(0);
  });

  it('formats updated timestamp', () => {
    expect(formatSettingsUpdatedAt(mockTenantSettings.updated_at)).toContain(
      '2026',
    );
  });
});
