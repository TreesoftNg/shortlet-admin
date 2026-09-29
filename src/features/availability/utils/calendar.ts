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

export function groupUnitsByProperty<T extends { property_id: number; property_name: string }>(
  units: T[],
): Array<{ propertyId: number; propertyName: string; units: T[] }> {
  const groups: Array<{ propertyId: number; propertyName: string; units: T[] }> = [];

  units.forEach((unit) => {
    const existing = groups.find((group) => group.propertyId === unit.property_id);
    if (existing) {
      existing.units.push(unit);
      return;
    }

    groups.push({
      propertyId: unit.property_id,
      propertyName: unit.property_name,
      units: [unit],
    });
  });

  return groups;
}
