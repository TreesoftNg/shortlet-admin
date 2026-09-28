import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { DashboardSummary } from '@/shared/types/hospitable';

export async function fetchDashboardSummary(period = '30d') {
  if (isMockMode()) {
    return mockApi.getDashboardSummary();
  }

  return apiClient<DashboardSummary>(`/reports/summary?period=${period}`);
}
