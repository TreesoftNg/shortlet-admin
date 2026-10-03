import type { UnitCalendarSummary } from '../types';
import { describeImportHealth } from './calendar-sync-format';

export type CalendarSyncHealthTab =
  | 'all'
  | 'connected'
  | 'failing'
  | 'not_connected'
  | 'needs_attention';

export type CalendarSyncFilters = {
  tab: CalendarSyncHealthTab;
  search: string;
};

export type CalendarSyncTabCount = Record<CalendarSyncHealthTab, number>;

export const DEFAULT_CALENDAR_SYNC_FILTERS: CalendarSyncFilters = {
  tab: 'all',
  search: '',
};

function isConnected(unit: UnitCalendarSummary): boolean {
  return unit.feed != null;
}

function isFailing(unit: UnitCalendarSummary): boolean {
  return (unit.feed?.consecutiveFailures ?? 0) > 0;
}

function needsAttention(unit: UnitCalendarSummary): boolean {
  if (!unit.feed) return true;
  if (unit.feed.consecutiveFailures > 0) return true;
  if (unit.feed.awaitingEmptyFeedConfirmation) return true;
  if (!unit.feed.lastSucceededAt) return true;
  if (!unit.exportFeed) return true;
  return false;
}

function matchesTab(unit: UnitCalendarSummary, tab: CalendarSyncHealthTab): boolean {
  switch (tab) {
    case 'connected':
      return isConnected(unit);
    case 'failing':
      return isFailing(unit);
    case 'not_connected':
      return !isConnected(unit);
    case 'needs_attention':
      return needsAttention(unit);
    default:
      return true;
  }
}

function matchesSearch(unit: UnitCalendarSummary, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    unit.name,
    unit.publicName,
    unit.hospitablePropertyId,
    unit.status,
    describeImportHealth(unit.feed).label,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function countCalendarSyncTabs(units: UnitCalendarSummary[]): CalendarSyncTabCount {
  return {
    all: units.length,
    connected: units.filter(isConnected).length,
    failing: units.filter(isFailing).length,
    not_connected: units.filter((unit) => !isConnected(unit)).length,
    needs_attention: units.filter(needsAttention).length,
  };
}

export function filterCalendarUnits(
  units: UnitCalendarSummary[],
  filters: CalendarSyncFilters,
): UnitCalendarSummary[] {
  return units.filter(
    (unit) => matchesTab(unit, filters.tab) && matchesSearch(unit, filters.search),
  );
}

/** Units that currently have an import feed and can be synced. */
export function syncableUnitIds(units: UnitCalendarSummary[]): string[] {
  return units.filter((unit) => unit.feed != null).map((unit) => unit.unitId);
}
