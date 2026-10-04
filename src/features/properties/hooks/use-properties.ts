'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchProperties, fetchProperty } from '../api/properties-service';

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties.list(),
    queryFn: fetchProperties,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id ?? ''),
    queryFn: () => fetchProperty(id!),
    enabled: Boolean(id),
  });
}
