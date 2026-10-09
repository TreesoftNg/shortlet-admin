/**
 * Calendar date helpers — pure functions for the availability grid.
 */

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateValue: string, amount: number): string {
  const date = parseDateOnly(dateValue);
  date.setDate(date.getDate() + amount);
  return formatDateOnly(date);
}

export function eachDateInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function isWeekend(dateValue: string): boolean {
  const day = parseDateOnly(dateValue).getDay();
  return day === 0 || day === 6;
}

export function getDayName(dateValue: string): string {
  return parseDateOnly(dateValue).toLocaleDateString('en-US', { weekday: 'short' });
}

export function getDayNumber(dateValue: string): number {
  return parseDateOnly(dateValue).getDate();
}

export function formatRangeLabel(startDate: string, endDate: string): string {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();

  const startLabel = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? 'numeric' : 'numeric',
  });

  return `${startLabel} – ${endLabel}`;
}

export type BarLayout = {
  startIndex: number;
  spanDays: number;
  /** CSS left relative to the start cell */
  leftPercent: number;
  /** CSS width spanning N day cells from the start cell midpoint */
  widthCalc: string;
};

/**
 * Map an inclusive bar onto a visible day window.
 * Design: bar starts at 50% of the start cell and spans across following cells.
 */
export function getBarLayout(
  startDate: string,
  endDate: string,
  visibleDates: string[],
): BarLayout | null {
  const startIndex = visibleDates.indexOf(startDate);
  const endIndex = visibleDates.indexOf(endDate);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    return null;
  }

  const spanDays = endIndex - startIndex;

  return {
    startIndex,
    spanDays,
    leftPercent: 50,
    widthCalc: `calc(${spanDays * 100}% - 4px)`,
  };
}

export type UnitGroup<T> = {
  key: string;
  propertyId: string | null;
  propertyName: string;
  units: T[];
};

/** Groups units under their property, keeping the API's order; units without one go last. */
export function groupUnitsByProperty<
  T extends { propertyId: string | null; propertyName: string | null },
>(units: T[]): Array<UnitGroup<T>> {
  const groups = new Map<string, UnitGroup<T>>();
  for (const unit of units) {
    const key = unit.propertyId ?? 'none';
    const group = groups.get(key) ?? {
      key,
      propertyId: unit.propertyId,
      propertyName: unit.propertyName ?? 'No property',
      units: [],
    };
    group.units.push(unit);
    groups.set(key, group);
  }
  return Array.from(groups.values()).sort(
    (a, b) => Number(a.propertyId === null) - Number(b.propertyId === null),
  );
}

/** Nights shown for each range. */
export const RANGE_NIGHTS = { week: 7, '2weeks': 14, month: 31 } as const;

/** `[from, to)` for a range starting at `anchor`. */
export function calendarWindow(
  anchor: string,
  range: keyof typeof RANGE_NIGHTS,
): { from: string; to: string } {
  return { from: anchor, to: addDays(anchor, RANGE_NIGHTS[range]) };
}

/** Today's date in Lagos, where the business runs (`YYYY-MM-DD`). */
export function todayInLagos(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export type EventLayout = {
  /** Visible night the bar is drawn from. */
  startIndex: number;
  leftPercent: number;
  widthCalc: string;
  /** The event continues before or after the visible window. */
  clippedStart: boolean;
  clippedEnd: boolean;
};

/**
 * Places a `[startDate, endDate)` stay on the visible nights. Like the
 * design, a bar runs from midday of its first night to midday of check-out
 * day. A stay that starts before the window starts at the first cell's edge;
 * one that ends after it runs to the last cell's edge.
 */
export function getEventLayout(
  startDate: string,
  endDate: string,
  nights: string[],
): EventLayout | null {
  if (!nights.length) return null;
  const first = nights[0];
  const afterLast = addDays(nights[nights.length - 1], 1);
  if (endDate <= first || startDate >= afterLast) return null;

  const clippedStart = startDate < first;
  // Check-out on the day after the window still runs past its right edge.
  const clippedEnd = endDate >= afterLast;
  const startIndex = clippedStart ? 0 : nights.indexOf(startDate);
  const endIndex = clippedEnd ? nights.length : nights.indexOf(endDate);
  if (startIndex < 0 || endIndex < 0) return null;

  const startOffset = clippedStart ? 0 : 0.5;
  const endOffset = clippedEnd ? 0 : 0.5;
  const span = endIndex - startIndex + endOffset - startOffset;
  return {
    startIndex,
    leftPercent: startOffset * 100,
    widthCalc: `calc(${span * 100}% - 4px)`,
    clippedStart,
    clippedEnd,
  };
}

/** True when a `[startDate, endDate)` stay covers this night. */
export function coversNight(
  event: { startDate: string; endDate: string },
  night: string,
): boolean {
  return event.startDate <= night && night < event.endDate;
}

/**
 * Extends a selection of nights from `anchor` to `night` on one unit, or
 * returns null if any night in between is taken or in the past. Returns the
 * selection as `[startDate, endDate)`.
 */
export function selectNights(
  anchor: string,
  night: string,
  isFree: (night: string) => boolean,
): { startDate: string; endDate: string } | null {
  const [start, last] = anchor <= night ? [anchor, night] : [night, anchor];
  for (let cursor = start; cursor <= last; cursor = addDays(cursor, 1)) {
    if (!isFree(cursor)) return null;
  }
  return { startDate: start, endDate: addDays(last, 1) };
}
