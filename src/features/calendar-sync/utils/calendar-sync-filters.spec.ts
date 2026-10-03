import {
  countCalendarSyncTabs,
  DEFAULT_CALENDAR_SYNC_FILTERS,
  filterCalendarUnits,
  syncableUnitIds,
} from './calendar-sync-filters';
import type { ImportFeed, UnitCalendarSummary } from '../types';

const feed = (overrides: Partial<ImportFeed> = {}): ImportFeed => ({
  unitId: 'u1',
  provider: 'hospitable',
  host: 'api.hospitable.com',
  status: 'active',
  lastFetchedAt: '2026-10-01T11:00:00Z',
  lastSucceededAt: '2026-10-01T11:00:00Z',
  lastError: null,
  consecutiveFailures: 0,
  nextFetchAt: '2026-10-01T12:00:00Z',
  awaitingEmptyFeedConfirmation: false,
  upcomingEventCount: 1,
  ...overrides,
});

const unit = (overrides: Partial<UnitCalendarSummary> = {}): UnitCalendarSummary => ({
  unitId: 'unit-1',
  name: 'Charming 1bedroom',
  publicName: 'Charming',
  status: 'active',
  hospitablePropertyId: 'p1',
  timezone: 'Africa/Lagos',
  feed: null,
  exportFeed: null,
  upcomingBlockCount: 0,
  ...overrides,
});

describe('calendar-sync-filters', () => {
  const units = [
    unit({ unitId: 'a', name: 'Azure A', feed: feed() }),
    unit({
      unitId: 'b',
      name: 'Azure B',
      feed: feed({ consecutiveFailures: 2, lastError: 'HTTP 403' }),
    }),
    unit({ unitId: 'c', name: 'Palms Studio', feed: null }),
  ];

  it('counts health tabs', () => {
    const counts = countCalendarSyncTabs(units);
    expect(counts.all).toBe(3);
    expect(counts.connected).toBe(2);
    expect(counts.failing).toBe(1);
    expect(counts.not_connected).toBe(1);
    expect(counts.needs_attention).toBe(3);
  });

  it('filters by tab and search', () => {
    expect(
      filterCalendarUnits(units, { ...DEFAULT_CALENDAR_SYNC_FILTERS, tab: 'failing' }).map(
        (item) => item.unitId,
      ),
    ).toEqual(['b']);

    expect(
      filterCalendarUnits(units, {
        ...DEFAULT_CALENDAR_SYNC_FILTERS,
        search: 'palms',
      }).map((item) => item.unitId),
    ).toEqual(['c']);
  });

  it('lists syncable unit ids', () => {
    expect(syncableUnitIds(units)).toEqual(['a', 'b']);
  });
});
