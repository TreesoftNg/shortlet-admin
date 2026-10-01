import { ApiClientError } from '@/shared/api/types';
import type { ExportFeed, ImportFeed, SyncResult } from '../types';
import {
  countNights,
  describeExportHealth,
  describeImportHealth,
  describeSyncResult,
  errorMessage,
  formatNextSync,
  formatRelativeTime,
  formatStayDate,
  isReachableByHospitable,
  looksLikeHospitableIcalUrl,
  todayIsoDate,
  validateBlockInput,
} from './calendar-sync-format';

const NOW = Date.parse('2026-10-01T12:00:00Z');
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

const feed = (overrides: Partial<ImportFeed> = {}): ImportFeed => ({
  unitId: 'u1',
  provider: 'hospitable',
  host: 'api.hospitable.com',
  status: 'active',
  lastFetchedAt: minutesAgo(5),
  lastSucceededAt: minutesAgo(5),
  lastError: null,
  consecutiveFailures: 0,
  nextFetchAt: minutesAgo(-10),
  awaitingEmptyFeedConfirmation: false,
  upcomingEventCount: 1,
  ...overrides,
});

describe('describeImportHealth', () => {
  it.each([
    [null, 'Not connected', 'mute'],
    [feed(), 'Syncing', 'ok'],
    [feed({ consecutiveFailures: 2, lastError: 'x' }), 'Failing', 'danger'],
    [feed({ awaitingEmptyFeedConfirmation: true }), 'Checking', 'warn'],
    [feed({ lastSucceededAt: null }), 'Waiting for first sync', 'info'],
  ])('%#: %s', (input, label, tone) => {
    expect(describeImportHealth(input)).toEqual({ label, tone });
  });
});

describe('describeExportHealth', () => {
  const exportFeed = (lastAccessedAt: string | null): ExportFeed => ({
    unitId: 'u1',
    createdAt: minutesAgo(600),
    issuedAt: minutesAgo(600),
    lastAccessedAt,
  });

  it('follows whether Hospitable is fetching the link', () => {
    expect(describeExportHealth(null, NOW).label).toBe('Not set up');
    expect(describeExportHealth(exportFeed(null), NOW).label).toBe('Waiting for Hospitable');
    expect(describeExportHealth(exportFeed(minutesAgo(30)), NOW)).toEqual({ label: 'Sending', tone: 'ok' });
    expect(describeExportHealth(exportFeed(minutesAgo(240)), NOW).label).toBe('Not fetched recently');
  });
});

describe('time formatting', () => {
  it('formats relative times', () => {
    expect(formatRelativeTime(null, NOW)).toBe('Never');
    expect(formatRelativeTime(minutesAgo(0), NOW)).toBe('just now');
    expect(formatRelativeTime(minutesAgo(5), NOW)).toBe('5 min ago');
    expect(formatRelativeTime(minutesAgo(180), NOW)).toBe('3 h ago');
    expect(formatRelativeTime(minutesAgo(60 * 24), NOW)).toBe('1 day ago');
  });

  it('formats the next sync, never in the past', () => {
    expect(formatNextSync(minutesAgo(-12), NOW)).toBe('in 12 min');
    expect(formatNextSync(minutesAgo(-120), NOW)).toBe('in 2 h');
    expect(formatNextSync(minutesAgo(10), NOW)).toBe('Due now');
  });

  it('formats stay dates and counts nights', () => {
    expect(formatStayDate('2026-10-02')).toBe('Fri, 2 Oct 2026');
    expect(countNights('2026-10-02', '2026-10-04')).toBe(2);
    expect(countNights('2026-03-28', '2026-03-30')).toBe(2);
  });

  it("gives today's date in the unit's timezone", () => {
    const lateEvening = new Date('2026-10-01T23:30:00Z');
    expect(todayIsoDate('Africa/Lagos', lateEvening)).toBe('2026-10-02');
    expect(todayIsoDate('UTC', lateEvening)).toBe('2026-10-01');
    expect(todayIsoDate(null, lateEvening)).toBe('2026-10-02');
  });
});

describe('describeSyncResult', () => {
  const result = (overrides: Partial<SyncResult>): SyncResult => ({
    feedId: 'f1',
    unitId: 'u1',
    outcome: 'synced',
    eventsInFeed: 3,
    created: 1,
    updated: 1,
    removed: 0,
    error: null,
    ...overrides,
  });

  it('explains each outcome', () => {
    expect(describeSyncResult(result({}))).toBe('3 booking(s) in Hospitable: 1 new, 1 changed, 0 released.');
    expect(describeSyncResult(result({ outcome: 'unchanged' }))).toBe('Already up to date.');
    expect(describeSyncResult(result({ outcome: 'awaiting_confirmation' }))).toMatch(/next sync confirms/);
    expect(describeSyncResult(result({ outcome: 'locked' }))).toMatch(/already running/);
    expect(describeSyncResult(result({ outcome: 'failed', error: 'Rejected (HTTP 403)' }))).toBe('Rejected (HTTP 403)');
  });
});

describe('URL checks', () => {
  it('recognises Hospitable iCal links', () => {
    expect(
      looksLikeHospitableIcalUrl('https://api.hospitable.com/v1/properties/reservations.ics?key=1&token=abc'),
    ).toBe(true);
    expect(looksLikeHospitableIcalUrl('http://api.hospitable.com/x.ics')).toBe(false);
    expect(looksLikeHospitableIcalUrl('https://example.com/x.ics')).toBe(false);
    expect(looksLikeHospitableIcalUrl('not a url')).toBe(false);
  });

  it('knows which export links Hospitable can reach', () => {
    expect(isReachableByHospitable('https://api-staging.sunmadeapartments.com/api/v1/x.ics')).toBe(true);
    expect(isReachableByHospitable('http://localhost:4000/api/v1/x.ics')).toBe(false);
    expect(isReachableByHospitable('https://localhost/x.ics')).toBe(false);
    expect(isReachableByHospitable('http://api.example.com/x.ics')).toBe(false);
  });
});

describe('validateBlockInput', () => {
  const today = '2026-10-01';

  it('accepts a future range', () => {
    expect(validateBlockInput({ startDate: '2026-10-05', endDate: '2026-10-07', reason: 'other' }, today)).toEqual({});
  });

  it('explains missing, past and reversed dates', () => {
    expect(validateBlockInput({ startDate: '', endDate: '', reason: 'other' }, today)).toEqual({
      startDate: 'Choose the first night to block.',
      endDate: 'Choose the checkout day.',
    });
    expect(validateBlockInput({ startDate: '2026-09-30', endDate: '2026-10-02', reason: 'other' }, today).startDate).toMatch(/past/);
    expect(validateBlockInput({ startDate: '2026-10-05', endDate: '2026-10-05', reason: 'other' }, today).endDate).toMatch(/after/);
  });
});

describe('errorMessage', () => {
  it('uses the API message when there is one', () => {
    expect(errorMessage(new ApiClientError('Overlaps a block', { code: 'RESOURCE_CONFLICT', status: 409 }))).toBe('Overlaps a block');
    expect(errorMessage('nope')).toMatch(/Something went wrong/);
  });
});
