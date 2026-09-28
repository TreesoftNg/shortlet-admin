import { isMockMode, mockApi } from '@/mocks/api';
import type { RefundListItem } from '@/mocks/data/refunds';
import { apiClient } from '@/shared/api/client';

export async function fetchRefunds() {
  if (isMockMode()) {
    return mockApi.getRefunds();
  }

  return apiClient<RefundListItem[]>('/refunds');
}
