'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchUnitMedia } from '../api/unit-media-api';

export function useUnitMedia(unitId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.unitMedia.list(unitId ?? ''),
    queryFn: () => fetchUnitMedia(unitId!),
    enabled: Boolean(unitId),
  });
}
