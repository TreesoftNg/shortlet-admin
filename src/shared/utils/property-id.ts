/** Property filter value used in list/calendar toolbars. */
export type PropertyIdFilter = number | 'all';

export function parsePropertyIdFilter(value: string): PropertyIdFilter {
  if (value === 'all' || value === '') return 'all';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 'all';
}

export function propertyIdFilterToInputValue(
  value: PropertyIdFilter,
): string {
  return value === 'all' ? 'all' : String(value);
}
