import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { DashboardData, ReportPeriod } from '../types';

/** GET /cc/dashboard?period= */
export async function fetchDashboard(period: ReportPeriod): Promise<DashboardData> {
  return (await apiClient<DashboardData>(adminPath(`/dashboard?period=${period}`))).data;
}
