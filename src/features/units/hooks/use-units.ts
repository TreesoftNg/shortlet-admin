'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchUnit, fetchUnits } from '../api/units-service';

export function useUnits() {
  return useQuery({
    queryKey: queryKeys.units.list(),
    queryFn: fetchUnits,
  });
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.units.detail(id ?? ''),
    queryFn: () => fetchUnit(id!),
    enabled: Boolean(id),
  });
}
