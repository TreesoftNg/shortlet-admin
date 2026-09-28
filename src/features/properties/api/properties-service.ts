import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Property } from '@/shared/types/hospitable';

export async function fetchProperties() {
  if (isMockMode()) {
    return mockApi.getProperties();
  }

  return apiClient<Property[]>('/properties');
}
