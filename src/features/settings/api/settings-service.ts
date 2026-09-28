import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { TenantSettings } from '@/shared/types/hospitable';

export async function fetchSettings() {
  if (isMockMode()) {
    return mockApi.getSettings();
  }

  return apiClient<TenantSettings>('/settings');
}
