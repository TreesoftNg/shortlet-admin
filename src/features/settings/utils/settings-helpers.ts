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
  return settings.filter((item) => item.value).length;
}

/** Build a key → boolean map for PUT /cc/tenant-settings. */
export function settingsValuesMap(
  settings: TenantSettingItem[],
): Record<string, boolean> {
  return Object.fromEntries(settings.map((item) => [item.key, item.value]));
}
