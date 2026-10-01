import { apiClient } from '@/shared/api/client';
import { ApiClientError } from '@/shared/api/types';
import type {
  AvailabilityBlock,
  BookingScope,
  ConnectImportFeedResult,
  CreateBlockInput,
  DisconnectImportFeedResult,
  ExportFeed,
  ImportedBooking,
  IssuedExportFeed,
  SyncResult,
  UnitCalendarSummary,
} from '../types';

const unitPath = (unitId: string) => `/admin/units/${encodeURIComponent(unitId)}`;

/** Resolves to null instead of throwing when the resource does not exist yet. */
async function orNullWhenMissing<T>(request: Promise<{ data: T }>): Promise<T | null> {
  try {
    return (await request).data;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchCalendarUnits(): Promise<UnitCalendarSummary[]> {
  return (await apiClient<UnitCalendarSummary[]>('/admin/calendar/units')).data;
}

// ─── Import from Hospitable ──────────────────────────────────────

export async function connectImportFeed(unitId: string, url: string): Promise<ConnectImportFeedResult> {
  const response = await apiClient<ConnectImportFeedResult>(`${unitPath(unitId)}/calendar-import`, {
    method: 'PUT',
    body: { url },
  });
  return response.data;
}

export async function syncImportFeed(unitId: string): Promise<SyncResult> {
  return (await apiClient<SyncResult>(`${unitPath(unitId)}/calendar-import/sync`, { method: 'POST' })).data;
}

export async function disconnectImportFeed(unitId: string): Promise<DisconnectImportFeedResult> {
  const response = await apiClient<DisconnectImportFeedResult>(`${unitPath(unitId)}/calendar-import`, {
    method: 'DELETE',
  });
  return response.data;
}

export async function fetchImportedBookings(unitId: string, scope: BookingScope): Promise<ImportedBooking[]> {
  const response = await apiClient<ImportedBooking[]>(
    `${unitPath(unitId)}/calendar-import/events?scope=${scope}`,
  );
  return response.data;
}

// ─── Blocked dates ───────────────────────────────────────────────

export async function fetchBlocks(unitId: string): Promise<AvailabilityBlock[]> {
  return (await apiClient<AvailabilityBlock[]>(`${unitPath(unitId)}/availability-blocks`)).data;
}

export async function createBlock(unitId: string, input: CreateBlockInput): Promise<AvailabilityBlock> {
  const response = await apiClient<AvailabilityBlock>(`${unitPath(unitId)}/availability-blocks`, {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function deleteBlock(unitId: string, blockId: string): Promise<void> {
  await apiClient<null>(`${unitPath(unitId)}/availability-blocks/${encodeURIComponent(blockId)}`, {
    method: 'DELETE',
  });
}

// ─── Export to Hospitable ────────────────────────────────────────

/** The export link's status, or null when the unit has none. */
export function fetchExportFeed(unitId: string): Promise<ExportFeed | null> {
  return orNullWhenMissing(apiClient<ExportFeed>(`${unitPath(unitId)}/calendar-export`));
}

export async function issueExportFeed(unitId: string): Promise<IssuedExportFeed> {
  return (await apiClient<IssuedExportFeed>(`${unitPath(unitId)}/calendar-export`, { method: 'POST' })).data;
}

export async function revokeExportFeed(unitId: string): Promise<void> {
  await apiClient<null>(`${unitPath(unitId)}/calendar-export`, { method: 'DELETE' });
}
