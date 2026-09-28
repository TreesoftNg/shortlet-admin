import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { StaffMember } from '@/shared/types/hospitable';

export async function fetchStaff() {
  if (isMockMode()) {
    return mockApi.getStaff();
  }

  return apiClient<StaffMember[]>('/staff');
}
