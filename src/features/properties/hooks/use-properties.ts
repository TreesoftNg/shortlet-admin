'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchProperties } from '../api/properties-service';

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties.list(),
    queryFn: fetchProperties,
    select: (response) => response.data,
  });
}
