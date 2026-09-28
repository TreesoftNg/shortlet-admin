'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchDashboardSummary } from '../api/dashboard-service';

export function useDashboardSummary(period = '30d') {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(period),
    queryFn: () => fetchDashboardSummary(period),
    select: (response) => response.data,
  });
}
