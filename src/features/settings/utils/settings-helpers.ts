import type { TenantSettingItem } from '../types';

export function formatSettingsUpdatedAt(iso: string | null): string {
  if (!iso) {
    return 'never';
  }
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function countEnabledNotifications(settings: TenantSettingItem[]): number {
  return settings.filter(
    (item) => item.valueType === 'boolean' && item.value === true,
  ).length;
}

/** Build a key → value map for PUT /cc/tenant-settings. */
export function settingsValuesMap(
  settings: TenantSettingItem[],
): Record<string, boolean | string> {
  return Object.fromEntries(settings.map((item) => [item.key, item.value]));
}

export function notificationSettings(
  settings: TenantSettingItem[],
): TenantSettingItem[] {
  return settings.filter((item) => item.category === 'notifications');
}

export function contactSettings(
  settings: TenantSettingItem[],
): TenantSettingItem[] {
  return settings.filter((item) => item.category === 'contact');
}
