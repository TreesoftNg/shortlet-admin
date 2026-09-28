'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchUnits } from '../api/units-service';

export function useUnits() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: fetchUnits,
    select: (response) => response.data,
  });
}
