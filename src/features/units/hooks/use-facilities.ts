'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchFacilities } from '../api/facilities-api';

export function useFacilities() {
  return useQuery({
    queryKey: queryKeys.facilities.list(),
    queryFn: fetchFacilities,
  });
}
