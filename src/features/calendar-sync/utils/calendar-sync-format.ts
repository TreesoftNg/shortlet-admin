import { ApiClientError } from '@/shared/api/types';
import type { StatusTone } from '@/shared/components/ui';
import type { BlockReason, CreateBlockInput, ExportFeed, ImportFeed, SyncResult } from '../types';

export const BLOCK_REASON_LABELS: Record<BlockReason, string> = {
  maintenance: 'Maintenance',
  owner_stay: 'Owner stay',
  other: 'Other',
};

/** Hospitable is told to re-check roughly hourly; allow for a missed fetch or two. */
const EXPORT_STALE_AFTER_MS = 3 * 60 * 60 * 1000;
const DEFAULT_TIMEZONE = 'Africa/Lagos';

export type Health = { label: string; tone: StatusTone };

export function describeImportHealth(feed: ImportFeed | null): Health {
  if (!feed) return { label: 'Not connected', tone: 'mute' };
  if (feed.consecutiveFailures > 0) return { label: 'Failing', tone: 'danger' };
  if (feed.awaitingEmptyFeedConfirmation) return { label: 'Checking', tone: 'warn' };
  if (!feed.lastSucceededAt) return { label: 'Waiting for first sync', tone: 'info' };
  return { label: 'Syncing', tone: 'ok' };
}

export function describeExportHealth(feed: ExportFeed | null, now = Date.now()): Health {
  if (!feed) return { label: 'Not set up', tone: 'mute' };
  if (!feed.lastAccessedAt) return { label: 'Waiting for Hospitable', tone: 'warn' };
  if (now - Date.parse(feed.lastAccessedAt) > EXPORT_STALE_AFTER_MS) {
    return { label: 'Not fetched recently', tone: 'warn' };
  }
  return { label: 'Sending', tone: 'ok' };
}

/** "just now", "5 min ago", "3 h ago", "2 days ago"; "Never" for null. */
export function formatRelativeTime(iso: string | null, now = Date.now()): string {
  if (!iso) return 'Never';
  const minutes = Math.round((now - Date.parse(iso)) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** "in 12 min", or "Due now" once the time has passed. */
export function formatNextSync(iso: string, now = Date.now()): string {
  const minutes = Math.round((Date.parse(iso) - now) / 60_000);
  if (minutes <= 0) return 'Due now';
  if (minutes < 60) return `in ${minutes} min`;
  return `in ${Math.round(minutes / 60)} h`;
}

/** A calendar date (`YYYY-MM-DD`) as "Fri, 2 Oct 2026". */
export function formatStayDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function countNights(startDate: string, endDate: string): number {
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000);
}

/** Today's date (`YYYY-MM-DD`) where the unit is. */
export function todayIsoDate(timezone: string | null = DEFAULT_TIMEZONE, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone ?? DEFAULT_TIMEZONE }).format(now);
}

export function describeSyncResult(result: SyncResult): string {
  switch (result.outcome) {
    case 'synced':
      return `${result.eventsInFeed} booking(s) in Hospitable: ${result.created} new, ${result.updated} changed, ${result.removed} released.`;
    case 'unchanged':
      return 'Already up to date.';
    case 'awaiting_confirmation':
      return 'Hospitable returned no bookings. Nights stay blocked until the next sync confirms it.';
    case 'locked':
      return 'A sync is already running. Try again in a moment.';
    case 'failed':
      return result.error ?? 'The sync failed.';
  }
}

/** Matches the Property iCal link shape from Hospitable's calendar settings. */
export function looksLikeHospitableIcalUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname === 'api.hospitable.com' && url.pathname.endsWith('.ics');
  } catch {
    return false;
  }
}

/** Hospitable fetches the export link from the internet, so it must be public https. */
export function isReachableByHospitable(value: string): boolean {
  try {
    const { protocol, hostname } = new URL(value);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(hostname) || hostname.endsWith('.local');
    return protocol === 'https:' && !local;
  } catch {
    return false;
  }
}

export type BlockFormErrors = Partial<Record<'startDate' | 'endDate', string>>;

export function validateBlockInput(input: CreateBlockInput, today: string): BlockFormErrors {
  const errors: BlockFormErrors = {};
  if (!input.startDate) errors.startDate = 'Choose the first night to block.';
  else if (input.startDate < today) errors.startDate = 'The first night cannot be in the past.';
  if (!input.endDate) errors.endDate = 'Choose the checkout day.';
  else if (input.startDate && input.endDate <= input.startDate) errors.endDate = 'Checkout must be after the first night.';
  return errors;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError || error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
