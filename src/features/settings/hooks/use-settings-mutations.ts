'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { updateSettings } from '../api/settings-service';

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, boolean>) => updateSettings(values),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings.detail(), data);
    },
  });
}
