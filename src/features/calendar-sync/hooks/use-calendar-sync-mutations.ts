'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  connectImportFeed,
  createBlock,
  deleteBlock,
  disconnectImportFeed,
  issueExportFeed,
  revokeExportFeed,
  syncImportFeed,
} from '../api/calendar-sync-api';
import type { CreateBlockInput } from '../types';

/** Every calendar-sync view can change after a mutation, so refresh them all. */
function useRefreshCalendarSync() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarSync.all });
}

export function useConnectImportFeed(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: (url: string) => connectImportFeed(unitId, url), onSuccess: refresh });
}

export function useSyncImportFeed(unitId: string) {
  const refresh = useRefreshCalendarSync();
  // A failed sync is still recorded on the feed, so refresh either way.
  return useMutation({ mutationFn: () => syncImportFeed(unitId), onSettled: refresh });
}

export function useDisconnectImportFeed(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: () => disconnectImportFeed(unitId), onSuccess: refresh });
}

export function useCreateBlock(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: (input: CreateBlockInput) => createBlock(unitId, input), onSuccess: refresh });
}

export function useDeleteBlock(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: (blockId: string) => deleteBlock(unitId, blockId), onSuccess: refresh });
}

export function useIssueExportFeed(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: () => issueExportFeed(unitId), onSuccess: refresh });
}

export function useRevokeExportFeed(unitId: string) {
  const refresh = useRefreshCalendarSync();
  return useMutation({ mutationFn: () => revokeExportFeed(unitId), onSuccess: refresh });
}
