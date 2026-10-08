'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ReportPeriod } from '@/features/dashboard/types';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchReports } from '../api/reports-service';

export function useReports(period: ReportPeriod, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reports.summary(period),
    queryFn: () => fetchReports(period),
    enabled,
    placeholderData: keepPreviousData,
  });
}
