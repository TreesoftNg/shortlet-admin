'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchStaff } from '../api/staff-service';

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.staff.list(),
    queryFn: fetchStaff,
    select: (response) => response.data,
  });
}
