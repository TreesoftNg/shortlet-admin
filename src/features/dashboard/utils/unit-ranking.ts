import type { UnitPerformance } from '../types';

export type UnitRanking = 'revenue' | 'occupancy' | 'bookings';

export const UNIT_RANKING_OPTIONS: Array<{ value: UnitRanking; label: string }> = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'occupancy', label: 'Occupancy' },
  { value: 'bookings', label: 'Bookings' },
];

export type UnitSortColumn = 'unit' | 'revenue' | 'bookings' | 'nights' | 'occupancy' | 'avgNightlyRate';

export type SortDirection = 'asc' | 'desc';

export type UnitWithOccupancy = UnitPerformance & { occupancyPercent: number };

export type UnitTotals = Pick<UnitPerformance, 'revenue' | 'bookings' | 'nights'>;

type Comparator = (a: UnitPerformance, b: UnitPerformance) => number;

// "Unit 2" before "Unit 10", ignoring case.
const nameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

const byName: Comparator = (a, b) => nameCollator.compare(a.unitName, b.unitName);
const byRevenueDesc: Comparator = (a, b) => b.revenue - a.revenue;
const byBookingsDesc: Comparator = (a, b) => b.bookings - a.bookings;

/** Orders two values in `direction`, with null always after a number. */
function compareNullable(a: number | null, b: number | null, direction: SortDirection): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  return direction === 'asc' ? a - b : b - a;
}

const byOccupancyDesc: Comparator = (a, b) => compareNullable(a.occupancyPercent, b.occupancyPercent, 'desc');

function chain(...comparators: Comparator[]): Comparator {
  return (a, b) => {
    for (const compare of comparators) {
      const order = compare(a, b);
      if (order !== 0) return order;
    }
    return 0;
  };
}

const RANKINGS: Record<UnitRanking, Comparator> = {
  revenue: chain(byRevenueDesc, byName),
  occupancy: chain(byOccupancyDesc, byRevenueDesc, byName),
  bookings: chain(byBookingsDesc, byRevenueDesc, byName),
};

/** The best `limit` units by `by`; ties go to revenue, then name. Units with no open nights rank last on occupancy. */
export function rankUnits(rows: UnitPerformance[], by: UnitRanking, limit: number): UnitPerformance[] {
  return [...rows].sort(RANKINGS[by]).slice(0, limit);
}

const hasOccupancy = (row: UnitPerformance): row is UnitWithOccupancy => row.occupancyPercent !== null;

/** The `limit` units with the lowest occupancy, leaving out units that had no open nights. */
export function lowestOccupancyUnits(rows: UnitPerformance[], limit: number): UnitWithOccupancy[] {
  return rows
    .filter(hasOccupancy)
    .sort(chain((a, b) => compareNullable(a.occupancyPercent, b.occupancyPercent, 'asc'), byName))
    .slice(0, limit);
}

/** Units whose name, code or property contains `query`, ignoring case. */
export function searchUnits(rows: UnitPerformance[], query: string): UnitPerformance[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    [row.unitName, row.unitCode, row.propertyName].some((field) => field?.toLowerCase().includes(needle)),
  );
}

const SORT_VALUES: Record<Exclude<UnitSortColumn, 'unit'>, (row: UnitPerformance) => number | null> = {
  revenue: (row) => row.revenue,
  bookings: (row) => row.bookings,
  nights: (row) => row.nights,
  occupancy: (row) => row.occupancyPercent,
  avgNightlyRate: (row) => row.avgNightlyRate,
};

/** Units sorted by a table column; equal values fall back to name, and no-occupancy units stay last. */
export function sortUnits(rows: UnitPerformance[], column: UnitSortColumn, direction: SortDirection): UnitPerformance[] {
  const byColumn: Comparator =
    column === 'unit'
      ? (a, b) => (direction === 'asc' ? byName(a, b) : byName(b, a))
      : (a, b) => compareNullable(SORT_VALUES[column](a), SORT_VALUES[column](b), direction);
  return [...rows].sort(chain(byColumn, byName));
}

/** Revenue, bookings and nights added up across `rows`. */
export function unitTotals(rows: UnitPerformance[]): UnitTotals {
  return rows.reduce(
    (totals, row) => ({
      revenue: totals.revenue + row.revenue,
      bookings: totals.bookings + row.bookings,
      nights: totals.nights + row.nights,
    }),
    { revenue: 0, bookings: 0, nights: 0 },
  );
}

/** "Garden Suite (GRA-01)", or just the name when the unit has no code. */
export function unitLabel(row: Pick<UnitPerformance, 'unitName' | 'unitCode'>): string {
  return row.unitCode ? `${row.unitName} (${row.unitCode})` : row.unitName;
}

/** The unit's property, or "Unassigned". */
export function unitPropertyLabel(row: Pick<UnitPerformance, 'propertyName'>): string {
  return row.propertyName ?? 'Unassigned';
}

/** Property names only help tell units apart when there is more than one property. */
export function showProperty(propertyCount: number): boolean {
  return propertyCount > 1;
}
