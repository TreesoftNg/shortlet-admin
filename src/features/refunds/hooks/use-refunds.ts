'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchRefunds } from '../api/refunds-service';

export function useRefunds() {
  return useQuery({
    queryKey: queryKeys.refunds.list(),
    queryFn: fetchRefunds,
    select: (response) => response.data,
  });
}
