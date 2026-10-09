import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { TenantSettingsResponse } from '../types';

/** GET /cc/tenant-settings — catalog merged with tenant overrides. */
export async function fetchSettings(): Promise<TenantSettingsResponse> {
  return (await apiClient<TenantSettingsResponse>(adminPath('/tenant-settings'))).data;
}

/** PUT /cc/tenant-settings — upsert notification toggles and contact fields. */
export async function updateSettings(
  values: Record<string, boolean | string>,
): Promise<TenantSettingsResponse> {
  return (
    await apiClient<TenantSettingsResponse>(adminPath('/tenant-settings'), {
      method: 'PUT',
      body: { values },
    })
  ).data;
}
