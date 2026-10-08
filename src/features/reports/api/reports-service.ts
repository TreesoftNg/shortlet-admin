import type { ReportPeriod } from '@/features/dashboard/types';
import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { ReportsData } from '../types';

/** GET /cc/reports?period= */
export async function fetchReports(period: ReportPeriod): Promise<ReportsData> {
  return (await apiClient<ReportsData>(adminPath(`/reports?period=${period}`))).data;
}
