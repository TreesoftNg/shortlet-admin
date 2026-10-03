import { ApiClientError } from '@/shared/api/types';
import type { ExportFeed, ImportFeed, SyncResult } from '../types';
import {
  addDaysIso,
  bookingsSearchHref,
  countNights,
  describeBlockApiError,
  describeCalendarApiError,
  describeIcalUrlIssue,
  describeImportGuidance,
  describeImportedBookingPhase,
  describeExportGuidance,
  describeExportHealth,
  describeImportHealth,
  describeSyncResult,
  errorMessage,
  findOverlappingBlocks,
  formatGuestParty,
  formatNextSync,
  formatRelativeTime,
  formatStayDate,
  icalUrlIssueMessage,
  isReachableByHospitable,
  looksLikeHospitableIcalUrl,
  normalizeIcalUrl,
  rangesOverlap,
  sortImportedBookings,
  syncToastStatus,
  todayIsoDate,
  truncateError,
  validateBlockInput,
} from './calendar-sync-format';
import type { AvailabilityBlock, ImportedBooking } from '../types';

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

  it('guides setup, first fetch, and stale export states', () => {
    expect(describeExportGuidance(null, NOW)?.title).toMatch(/No export link/);
    expect(describeExportGuidance(exportFeed(null), NOW)?.title).toMatch(/first fetch/);
    expect(describeExportGuidance(exportFeed(minutesAgo(240)), NOW)?.title).toMatch(/Not fetched recently/);
    expect(describeExportGuidance(exportFeed(minutesAgo(30)), NOW)).toBeNull();
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
  const valid =
    'https://api.hospitable.com/v1/properties/reservations.ics?key=1&token=abc';

  it('normalises pasted noise and recognises Hospitable iCal links', () => {
    expect(normalizeIcalUrl(`  "${valid}"  `)).toBe(valid);
    expect(looksLikeHospitableIcalUrl(`<${valid}>`)).toBe(true);
    expect(looksLikeHospitableIcalUrl(valid)).toBe(true);
    expect(looksLikeHospitableIcalUrl('http://api.hospitable.com/x.ics?key=1&token=a')).toBe(false);
    expect(looksLikeHospitableIcalUrl('https://example.com/x.ics?key=1&token=a')).toBe(false);
    expect(looksLikeHospitableIcalUrl('https://api.hospitable.com/x.ics?key=1')).toBe(false);
    expect(looksLikeHospitableIcalUrl('not a url')).toBe(false);
  });

  it('explains specific iCal URL issues', () => {
    expect(describeIcalUrlIssue('')).toBe('empty');
    expect(describeIcalUrlIssue('https://airbnb.com/cal.ics')).toBe('wrong_host');
    expect(describeIcalUrlIssue('https://api.hospitable.com/v1/cal')).toBe('not_ics');
    expect(describeIcalUrlIssue('https://api.hospitable.com/v1/cal.ics')).toBe('missing_secret');
    expect(icalUrlIssueMessage('missing_secret')).toMatch(/key and token/);
  });

  it('knows which export links Hospitable can reach', () => {
    expect(isReachableByHospitable('https://api-staging.sunmadeapartments.com/api/v1/x.ics')).toBe(true);
    expect(isReachableByHospitable('http://localhost:4000/api/v1/x.ics')).toBe(false);
    expect(isReachableByHospitable('https://localhost/x.ics')).toBe(false);
    expect(isReachableByHospitable('http://api.example.com/x.ics')).toBe(false);
  });
});

describe('import guidance and API errors', () => {
  it('maps connect/sync API failures', () => {
    expect(
      describeCalendarApiError(
        new ApiClientError('busy', { code: 'RESOURCE_CONFLICT', status: 409 }),
      ),
    ).toMatch(/already running/);
    expect(
      describeCalendarApiError(
        new ApiClientError('The calendar provider rejected this link (HTTP 403).', {
          code: 'INTEGRATION_ERROR',
          status: 502,
        }),
      ),
    ).toMatch(/rejected this link/);
  });

  it('guides empty-feed and failing import states', () => {
    expect(
      describeImportGuidance(feed({ awaitingEmptyFeedConfirmation: true }))?.title,
    ).toMatch(/Empty feed/);
    expect(describeImportGuidance(feed({ consecutiveFailures: 2, lastError: 'boom' }))?.tone).toBe(
      'error',
    );
    expect(describeImportGuidance(feed({ lastSucceededAt: null }))?.title).toMatch(/first sync/);
    expect(describeImportGuidance(feed())).toBeNull();
  });

  it('picks toast status from sync outcome', () => {
    expect(syncToastStatus('synced')).toBe('success');
    expect(syncToastStatus('awaiting_confirmation')).toBe('warning');
    expect(syncToastStatus('locked')).toBe('warning');
    expect(syncToastStatus('failed')).toBe('error');
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

describe('block overlap helpers', () => {
  const block = (overrides: Partial<AvailabilityBlock> = {}): AvailabilityBlock => ({
    id: 'b1',
    unitId: 'u1',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    nights: 2,
    reason: 'maintenance',
    note: null,
    createdAt: '',
    ...overrides,
  });

  it('detects overlapping half-open ranges', () => {
    expect(rangesOverlap('2026-10-10', '2026-10-12', '2026-10-11', '2026-10-13')).toBe(true);
    expect(rangesOverlap('2026-10-10', '2026-10-12', '2026-10-12', '2026-10-14')).toBe(false);
    expect(addDaysIso('2026-10-10', 1)).toBe('2026-10-11');
    expect(
      findOverlappingBlocks(
        { startDate: '2026-10-11', endDate: '2026-10-13' },
        [block()],
      ),
    ).toHaveLength(1);
  });

  it('maps block conflict API errors', () => {
    expect(
      describeBlockApiError(
        new ApiClientError('Overlaps a block', { code: 'RESOURCE_CONFLICT', status: 409 }),
      ),
    ).toBe('Overlaps a block');
    expect(
      describeBlockApiError(new ApiClientError('', { code: 'RESOURCE_CONFLICT', status: 409 })),
    ).toMatch(/overlap/i);
  });
});

describe('errorMessage', () => {
  it('uses the API message when there is one', () => {
    expect(errorMessage(new ApiClientError('Overlaps a block', { code: 'RESOURCE_CONFLICT', status: 409 }))).toBe('Overlaps a block');
    expect(errorMessage('nope')).toMatch(/Something went wrong/);
  });
});

describe('truncateError', () => {
  it('shortens long sync errors for table cells', () => {
    expect(truncateError(null)).toBeNull();
    expect(truncateError('HTTP 403')).toBe('HTTP 403');
    expect(truncateError('x'.repeat(60))?.endsWith('…')).toBe(true);
  });
});

describe('imported booking display', () => {
  const booking = (overrides: Partial<ImportedBooking> = {}): ImportedBooking => ({
    id: 'e1',
    source: 'hospitable',
    externalUid: 'x',
    reservationCode: 'QGUIPR',
    guestName: 'Ada Okafor',
    guestEmail: 'ada@example.com',
    guestPhone: null,
    adults: 2,
    children: 1,
    checkIn: '',
    checkOut: '',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    status: 'active',
    firstSeenAt: '',
    lastSeenAt: '',
    removedAt: null,
    ...overrides,
  });

  it('describes stay phase and guest party', () => {
    expect(describeImportedBookingPhase(booking(), '2026-10-01')).toEqual({
      label: 'Upcoming',
      tone: 'brand',
      phase: 'upcoming',
    });
    expect(
      describeImportedBookingPhase(
        booking({ startDate: '2026-09-28', endDate: '2026-10-05' }),
        '2026-10-01',
      ).phase,
    ).toBe('in_stay');
    expect(describeImportedBookingPhase(booking({ status: 'removed' }), '2026-10-01').label).toBe(
      'Cancelled',
    );
    expect(formatGuestParty(2, 1)).toBe('2 adults, 1 child');
  });

  it('builds a bookings search deep link and sorts stays', () => {
    expect(bookingsSearchHref(booking())).toBe('/bookings?search=QGUIPR');
    const sorted = sortImportedBookings(
      [
        booking({ id: 'past', startDate: '2026-09-01', endDate: '2026-09-03' }),
        booking({ id: 'soon', startDate: '2026-10-20', endDate: '2026-10-22' }),
        booking({
          id: 'now',
          startDate: '2026-09-28',
          endDate: '2026-10-05',
        }),
      ],
      'all',
      '2026-10-01',
    );
    expect(sorted.map((item) => item.id)).toEqual(['now', 'soon', 'past']);
  });
});
