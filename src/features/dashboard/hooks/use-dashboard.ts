'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchDashboard } from '../api/dashboard-service';
import type { ReportPeriod } from '../types';

export function useDashboard(period: ReportPeriod, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: () => fetchDashboard(period),
    enabled,
    // Keep the last period on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}
