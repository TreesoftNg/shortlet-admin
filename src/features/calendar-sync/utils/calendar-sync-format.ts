import { ApiClientError } from '@/shared/api/types';
import type { StatusTone } from '@/shared/components/ui';
import type {
  AvailabilityBlock,
  BlockReason,
  CreateBlockInput,
  ExportFeed,
  ImportFeed,
  ImportedBooking,
  SyncResult,
} from '../types';

export const BLOCK_REASON_LABELS: Record<BlockReason, string> = {
  maintenance: 'Maintenance',
  owner_stay: 'Owner stay',
  other: 'Other',
};

export const BLOCK_REASON_TONES: Record<BlockReason, StatusTone> = {
  maintenance: 'warn',
  owner_stay: 'info',
  other: 'mute',
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

export type ExportGuidance = {
  tone: 'info' | 'warning' | 'error';
  title: string;
  body: string;
};

/** Contextual banner for export feed health (status-only view, never shows the secret URL). */
export function describeExportGuidance(
  feed: ExportFeed | null,
  now = Date.now(),
): ExportGuidance | null {
  if (!feed) {
    return {
      tone: 'info',
      title: 'No export link yet',
      body: 'Create a link, then paste it into Hospitable’s iCal import so blocked dates close Airbnb and Booking.com.',
    };
  }
  if (!feed.lastAccessedAt) {
    return {
      tone: 'warning',
      title: 'Waiting for Hospitable’s first fetch',
      body: 'The link exists, but Hospitable has not pulled it yet. Confirm it is pasted under iCal import — checks are usually about once an hour.',
    };
  }
  if (now - Date.parse(feed.lastAccessedAt) > EXPORT_STALE_AFTER_MS) {
    return {
      tone: 'warning',
      title: 'Not fetched recently',
      body: 'Hospitable has not requested this feed in a while. Check the import is still enabled there, or rotate the link and paste the new one.',
    };
  }
  return null;
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

export type ImportedBookingPhase = 'cancelled' | 'in_stay' | 'upcoming' | 'past';

export function describeImportedBookingPhase(
  booking: Pick<ImportedBooking, 'status' | 'startDate' | 'endDate'>,
  today: string,
): { label: string; tone: StatusTone; phase: ImportedBookingPhase } {
  if (booking.status === 'removed') {
    return { label: 'Cancelled', tone: 'mute', phase: 'cancelled' };
  }
  if (booking.startDate <= today && booking.endDate > today) {
    return { label: 'In stay', tone: 'ok', phase: 'in_stay' };
  }
  if (booking.startDate > today) {
    return { label: 'Upcoming', tone: 'brand', phase: 'upcoming' };
  }
  return { label: 'Past', tone: 'mute', phase: 'past' };
}

export function formatGuestParty(adults: number | null, children: number | null): string | null {
  const parts = [
    adults != null && adults > 0 ? `${adults} adult${adults === 1 ? '' : 's'}` : null,
    children != null && children > 0
      ? `${children} child${children === 1 ? '' : 'ren'}`
      : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/** Deep-link into Bookings filtered by reservation code or guest name. */
export function bookingsSearchHref(booking: Pick<ImportedBooking, 'reservationCode' | 'guestName'>): string | null {
  const query = (booking.reservationCode ?? booking.guestName ?? '').trim();
  if (!query) return null;
  return `/bookings?search=${encodeURIComponent(query)}`;
}

export function sortImportedBookings(
  bookings: ImportedBooking[],
  scope: 'upcoming' | 'all',
  today: string,
): ImportedBooking[] {
  return [...bookings].sort((a, b) => {
    if (scope === 'all') {
      const phaseRank = (booking: ImportedBooking) => {
        const phase = describeImportedBookingPhase(booking, today).phase;
        if (phase === 'in_stay') return 0;
        if (phase === 'upcoming') return 1;
        if (phase === 'past') return 2;
        return 3;
      };
      const rankDiff = phaseRank(a) - phaseRank(b);
      if (rankDiff !== 0) return rankDiff;
    }
    return a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate);
  });
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

/** Strip common paste noise (spaces, quotes, angle brackets) before validating. */
export function normalizeIcalUrl(value: string): string {
  return value.trim().replace(/^['"<]+/, '').replace(/['">]+$/, '').trim();
}

export type IcalUrlIssue =
  | 'empty'
  | 'invalid'
  | 'not_https'
  | 'wrong_host'
  | 'not_ics'
  | 'missing_secret';

/** Why a pasted value is not a usable Hospitable Property iCal link. */
export function describeIcalUrlIssue(value: string): IcalUrlIssue | null {
  const raw = normalizeIcalUrl(value);
  if (!raw) return 'empty';

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 'invalid';
  }

  if (url.protocol !== 'https:') return 'not_https';
  if (url.hostname !== 'api.hospitable.com') return 'wrong_host';
  if (!url.pathname.toLowerCase().endsWith('.ics')) return 'not_ics';

  const hasKey = Boolean(url.searchParams.get('key')?.trim());
  const hasToken = Boolean(url.searchParams.get('token')?.trim());
  if (!hasKey || !hasToken) return 'missing_secret';

  return null;
}

export function icalUrlIssueMessage(issue: IcalUrlIssue): string {
  switch (issue) {
    case 'empty':
      return 'Paste the Hospitable Property iCal link.';
    case 'invalid':
      return 'That does not look like a URL. Paste the full https://api.hospitable.com/… .ics link.';
    case 'not_https':
      return 'The link must start with https://.';
    case 'wrong_host':
      return 'Use the Hospitable export link (https://api.hospitable.com/…), not Airbnb or Booking.com.';
    case 'not_ics':
      return 'The link must end with .ics (Property iCal export).';
    case 'missing_secret':
      return 'This link is incomplete. Copy the full Property iCal link including key and token.';
  }
}

/** Matches the Property iCal link shape from Hospitable's calendar settings. */
export function looksLikeHospitableIcalUrl(value: string): boolean {
  return describeIcalUrlIssue(value) === null;
}

/** Friendlier copy for connect/sync API failures (409 conflict, 502 integration, etc.). */
export function describeCalendarApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 409 || error.code === 'RESOURCE_CONFLICT') {
      return 'A sync is already running for this unit. Wait a moment, then try again.';
    }
    if (error.status === 502 || error.code === 'INTEGRATION_ERROR') {
      return (
        error.message ||
        'Hospitable could not be reached with this link. Check it is still valid, then try again.'
      );
    }
    if (error.status === 404 || error.code === 'RESOURCE_NOT_FOUND') {
      return 'This unit or calendar feed was not found. Refresh the page and try again.';
    }
    return error.message;
  }
  return errorMessage(error);
}

export type ImportGuidance = {
  tone: 'info' | 'warning' | 'error';
  title: string;
  body: string;
};

/** Contextual banner copy for the Import tab feed status. */
export function describeImportGuidance(feed: ImportFeed): ImportGuidance | null {
  if (feed.consecutiveFailures > 0) {
    return {
      tone: 'error',
      title: 'Import is failing',
      body:
        feed.lastError ??
        `${feed.consecutiveFailures} failed attempt${feed.consecutiveFailures === 1 ? '' : 's'}. Sync now, or replace the Hospitable link if it was rotated.`,
    };
  }
  if (feed.awaitingEmptyFeedConfirmation) {
    return {
      tone: 'warning',
      title: 'Empty feed — confirming',
      body:
        'Hospitable returned no bookings. Existing nights stay blocked until the next sync confirms this was real and not a temporary outage. Tap Sync now to check again.',
    };
  }
  if (!feed.lastSucceededAt) {
    return {
      tone: 'info',
      title: 'Waiting for first sync',
      body: 'The link is saved. Run Sync now to pull bookings in, or wait for the automatic sync.',
    };
  }
  return null;
}

export function syncToastStatus(
  outcome: SyncResult['outcome'],
): 'success' | 'warning' | 'error' {
  switch (outcome) {
    case 'failed':
      return 'error';
    case 'locked':
    case 'awaiting_confirmation':
      return 'warning';
    default:
      return 'success';
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

/** Half-open ranges [start, end) overlap when each starts before the other ends. */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

export function findOverlappingBlocks(
  input: Pick<CreateBlockInput, 'startDate' | 'endDate'>,
  blocks: AvailabilityBlock[],
): AvailabilityBlock[] {
  if (!input.startDate || !input.endDate || input.endDate <= input.startDate) return [];
  return blocks.filter((block) =>
    rangesOverlap(input.startDate, input.endDate, block.startDate, block.endDate),
  );
}

/** Next calendar day as YYYY-MM-DD (UTC date arithmetic). */
export function addDaysIso(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function describeBlockApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 409 || error.code === 'RESOURCE_CONFLICT') {
      return (
        error.message ||
        'These dates overlap an existing block or booking. Adjust the range and try again.'
      );
    }
    if (error.status === 404 || error.code === 'RESOURCE_NOT_FOUND') {
      return 'This unit was not found. Refresh the page and try again.';
    }
    return error.message;
  }
  return errorMessage(error);
}

export function sortAvailabilityBlocks(blocks: AvailabilityBlock[]): AvailabilityBlock[] {
  return [...blocks].sort(
    (a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate),
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError || error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

/** Short line for table cells; full text stays available via title tooltip. */
export function truncateError(message: string | null, maxLength = 48): string | null {
  if (!message) return null;
  const trimmed = message.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
