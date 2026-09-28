'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchSettings } from '../api/settings-service';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: fetchSettings,
    select: (response) => response.data,
  });
}
