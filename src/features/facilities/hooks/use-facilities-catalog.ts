'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchFacilityCatalog } from '../api/facilities-service';

export function useFacilitiesCatalog(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.facilities.catalog(),
    queryFn: fetchFacilityCatalog,
    enabled: options?.enabled ?? true,
  });
}
