import type { Property } from '@/shared/types/hospitable';

export type PropertyStatusTab = 'all' | 'listed' | 'unlisted';

export type PropertyFilters = {
  tab: PropertyStatusTab;
  search: string;
  city: string | 'all';
};

export type PropertyTabCount = Record<PropertyStatusTab, number>;

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  tab: 'all',
  search: '',
  city: 'all',
};

function matchesTab(property: Property, tab: PropertyStatusTab): boolean {
  if (tab === 'listed') return property.listed;
  if (tab === 'unlisted') return !property.listed;
  return true;
}

function matchesSearch(property: Property, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    property.name,
    property.public_name,
    property.address.display,
    property.address.city,
    property.property_type,
    ...(property.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesCity(property: Property, city: string | 'all'): boolean {
  if (city === 'all') return true;
  return property.address.city === city;
}

export function countPropertyTabs<T extends Property>(
  properties: T[],
): PropertyTabCount {
  return {
    all: properties.length,
    listed: properties.filter((item) => item.listed).length,
    unlisted: properties.filter((item) => !item.listed).length,
  };
}

export function filterProperties<T extends Property>(
  properties: T[],
  filters: PropertyFilters,
): T[] {
  return properties.filter(
    (property) =>
      matchesTab(property, filters.tab) &&
      matchesSearch(property, filters.search) &&
      matchesCity(property, filters.city),
  );
}

export function getPropertyCities<T extends Property>(properties: T[]): string[] {
  return Array.from(
    new Set(properties.map((property) => property.address.city).filter(Boolean)),
  ).sort();
}

export function formatPropertyType(property: Property): string {
  return property.property_type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatCapacity(property: Property): string {
  const { bedrooms, bathrooms, max } = property.capacity;
  return `${bedrooms} bed · ${bathrooms} bath · sleeps ${max}`;
}
