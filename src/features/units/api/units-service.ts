import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Unit } from '@/shared/types/hospitable';

export async function fetchUnits() {
  if (isMockMode()) {
    return mockApi.getUnits();
  }

  return apiClient<Unit[]>('/units');
}
