/** Open Availability focused on this unit (id + name for cross-system matching). */
export function availabilityHref(unit: {
  unitId: string;
  name: string;
}): string {
  const params = new URLSearchParams({
    unitId: unit.unitId,
    unitName: unit.name,
  });
  return `/availability?${params.toString()}`;
}

/** Open Calendar sync and select this unit's dialog. */
export function calendarSyncHref(unitId: string | number): string {
  const params = new URLSearchParams({ unitId: String(unitId) });
  return `/calendar-sync?${params.toString()}`;
}

/** Match a unit row when deep-linked by id and/or display name. */
export function unitMatchesAvailabilityHighlight(
  unit: { id: string | number; name: string },
  highlightedUnitId: string | null,
  highlightedUnitName: string | null,
): boolean {
  if (highlightedUnitId && String(unit.id) === highlightedUnitId) {
    return true;
  }
  if (
    highlightedUnitName &&
    unit.name.trim().toLowerCase() === highlightedUnitName.trim().toLowerCase()
  ) {
    return true;
  }
  return false;
}
