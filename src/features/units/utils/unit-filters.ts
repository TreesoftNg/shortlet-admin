import type { StatusTone } from '@/shared/components/ui';
import type { Property, Unit } from '@/shared/types/hospitable';
import type { PropertyIdFilter } from '@/shared/utils/property-id';

export type UnitStatusTab = 'all' | 'active' | 'maintenance' | 'inactive';

export type UnitFilters = {
  tab: UnitStatusTab;
  search: string;
  propertyId: PropertyIdFilter;
};

export type UnitTabCount = Record<UnitStatusTab, number>;

export type UnitListItem = Unit & {
  property_name: string;
  property_city: string;
  property_currency: string;
  property_amenities: string[];
};

export const DEFAULT_UNIT_FILTERS: UnitFilters = {
  tab: 'all',
  search: '',
  propertyId: 'all',
};

export function enrichUnitsWithProperty(
  units: Unit[],
  properties: Property[],
): UnitListItem[] {
  return units.map((unit) => {
    const property = unit.property_id
      ? properties.find((item) => String(item.id) === unit.property_id)
      : undefined;
    return {
      ...unit,
      property_name:
        property?.name ??
        unit.linked_property_name ??
        (unit.property_id ? 'Unknown property' : 'Unassigned'),
      property_city: property?.address.city ?? unit.city ?? '—',
      property_currency: property?.currency ?? unit.currency ?? 'NGN',
      property_amenities: property?.amenities ?? [],
    };
  });
}

function matchesTab(unit: Unit, tab: UnitStatusTab): boolean {
  if (tab === 'all') return true;
  return unit.status === tab;
}

function matchesSearch(unit: UnitListItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    unit.name,
    unit.code,
    unit.property_name,
    unit.property_city,
    unit.status,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesProperty(unit: Unit, propertyId: PropertyIdFilter): boolean {
  if (propertyId === 'all') return true;
  return unit.property_id === propertyId;
}

export function countUnitTabs(units: Unit[]): UnitTabCount {
  return {
    all: units.length,
    active: units.filter((item) => item.status === 'active').length,
    maintenance: units.filter((item) => item.status === 'maintenance').length,
    inactive: units.filter((item) => item.status === 'inactive').length,
  };
}

export function filterUnits(
  units: UnitListItem[],
  filters: UnitFilters,
): UnitListItem[] {
  return units.filter(
    (unit) =>
      matchesTab(unit, filters.tab) &&
      matchesSearch(unit, filters.search) &&
      matchesProperty(unit, filters.propertyId),
  );
}

export function getUnitStatusDisplay(status: Unit['status']): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'ok' };
    case 'maintenance':
      return { label: 'Maintenance', tone: 'warn' };
    case 'inactive':
      return { label: 'Inactive', tone: 'mute' };
    default:
      return { label: status, tone: 'mute' };
  }
}
