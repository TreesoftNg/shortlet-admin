import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { ReportsSummary } from '@/shared/types/hospitable';

export async function fetchReports() {
  if (isMockMode()) {
    return mockApi.getReports();
  }

  return apiClient<ReportsSummary>('/reports');
}
