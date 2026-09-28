'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchReports } from '../api/reports-service';

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: fetchReports,
    select: (response) => response.data,
  });
}
