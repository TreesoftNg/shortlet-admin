/** Property filter value used in list/calendar toolbars. */
export type PropertyIdFilter = string | 'all';

export function parsePropertyIdFilter(value: string): PropertyIdFilter {
  if (value === 'all' || value === '') return 'all';
  return value;
}

export function propertyIdFilterToInputValue(
  value: PropertyIdFilter,
): string {
  return value === 'all' ? 'all' : value;
}
