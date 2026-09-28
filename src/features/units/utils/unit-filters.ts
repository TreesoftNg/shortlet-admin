import type { StatusTone } from '@/shared/components/ui';
import type { Property, Unit } from '@/shared/types/hospitable';

export type UnitStatusTab = 'all' | 'active' | 'maintenance' | 'inactive';

export type UnitFilters = {
  tab: UnitStatusTab;
  search: string;
  propertyId: string | 'all';
};

export type UnitTabCount = Record<UnitStatusTab, number>;

export type UnitListItem = Unit & {
  property_name: string;
  property_city: string;
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
    const property = properties.find((item) => item.id === unit.property_id);
    return {
      ...unit,
      property_name: property?.name ?? 'Unknown property',
      property_city: property?.address.city ?? '—',
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

function matchesProperty(unit: Unit, propertyId: string | 'all'): boolean {
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
