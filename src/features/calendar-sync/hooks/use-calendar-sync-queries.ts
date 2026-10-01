'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchBlocks, fetchCalendarUnits, fetchExportFeed, fetchImportedBookings } from '../api/calendar-sync-api';
import type { BookingScope } from '../types';

/** Pass `enabled: false` when the caller lacks access, to skip a request that would be refused. */
export function useCalendarUnits({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: queryKeys.calendarSync.units(), queryFn: fetchCalendarUnits, enabled });
}

export function useImportedBookings(unitId: string, scope: BookingScope) {
  return useQuery({
    queryKey: queryKeys.calendarSync.bookings(unitId, scope),
    queryFn: () => fetchImportedBookings(unitId, scope),
  });
}

export function useBlocks(unitId: string) {
  return useQuery({ queryKey: queryKeys.calendarSync.blocks(unitId), queryFn: () => fetchBlocks(unitId) });
}

export function useExportFeed(unitId: string) {
  return useQuery({ queryKey: queryKeys.calendarSync.exportFeed(unitId), queryFn: () => fetchExportFeed(unitId) });
}
