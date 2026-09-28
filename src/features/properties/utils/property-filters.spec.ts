import {
  countPropertyTabs,
  DEFAULT_PROPERTY_FILTERS,
  filterProperties,
  formatCapacity,
  formatPropertyType,
  getPropertyCities,
} from './property-filters';
import { mockProperties } from '@/mocks/data';

describe('property-filters', () => {
  it('counts listed and unlisted tabs', () => {
    const counts = countPropertyTabs(mockProperties);
    expect(counts.all).toBe(mockProperties.length);
    expect(counts.listed).toBe(mockProperties.filter((item) => item.listed).length);
  });

  it('filters by search term', () => {
    const result = filterProperties(mockProperties, {
      ...DEFAULT_PROPERTY_FILTERS,
      search: 'ikoyi',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ikoyi Penthouse');
  });

  it('filters by city', () => {
    const result = filterProperties(mockProperties, {
      ...DEFAULT_PROPERTY_FILTERS,
      city: 'Lekki',
    });
    expect(result.every((item) => item.address.city === 'Lekki')).toBe(true);
  });

  it('returns sorted unique cities', () => {
    const cities = getPropertyCities(mockProperties);
    expect(cities).toContain('Lekki');
    expect(cities).toEqual([...cities].sort());
  });

  it('formats type and capacity labels', () => {
    expect(formatPropertyType(mockProperties[0])).toBe('Apartment');
    expect(formatCapacity(mockProperties[0])).toContain('2 bed');
  });
});
