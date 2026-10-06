'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlock, deleteBlock } from '@/features/calendar-sync/api/calendar-sync-api';
import type { CreateBlockInput } from '@/features/calendar-sync/types';
import { queryKeys } from '@/shared/api/query-keys';

function useRefreshCalendars() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarSync.all }),
    ]);
}

/** Block nights on any unit (the unit is chosen in the dialog). */
export function useBlockNights() {
  const refresh = useRefreshCalendars();
  return useMutation({
    mutationFn: ({ unitId, input }: { unitId: string; input: CreateBlockInput }) =>
      createBlock(unitId, input),
    onSuccess: refresh,
  });
}

export function useRemoveBlock() {
  const refresh = useRefreshCalendars();
  return useMutation({
    mutationFn: ({ unitId, blockId }: { unitId: string; blockId: string }) =>
      deleteBlock(unitId, blockId),
    onSuccess: refresh,
  });
}
