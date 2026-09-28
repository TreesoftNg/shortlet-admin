import {
  countUnitTabs,
  DEFAULT_UNIT_FILTERS,
  enrichUnitsWithProperty,
  filterUnits,
  getUnitStatusDisplay,
} from './unit-filters';
import { mockProperties, mockUnits } from '@/mocks/data';

describe('unit-filters', () => {
  const enriched = enrichUnitsWithProperty(mockUnits, mockProperties);

  it('enriches units with property names', () => {
    expect(enriched[0].property_name).toBe('Azure Lekki');
  });

  it('counts status tabs', () => {
    const counts = countUnitTabs(mockUnits);
    expect(counts.all).toBe(mockUnits.length);
    expect(counts.maintenance).toBeGreaterThan(0);
    expect(counts.inactive).toBeGreaterThan(0);
  });

  it('filters by search and property', () => {
    const bySearch = filterUnits(enriched, {
      ...DEFAULT_UNIT_FILTERS,
      search: 'studio',
    });
    expect(bySearch.every((item) => item.name.toLowerCase().includes('studio'))).toBe(
      true,
    );

    const byProperty = filterUnits(enriched, {
      ...DEFAULT_UNIT_FILTERS,
      propertyId: 'prop-azure',
    });
    expect(byProperty.every((item) => item.property_id === 'prop-azure')).toBe(true);
  });

  it('maps status display tones', () => {
    expect(getUnitStatusDisplay('active')).toEqual({ label: 'Active', tone: 'ok' });
    expect(getUnitStatusDisplay('maintenance')).toEqual({
      label: 'Maintenance',
      tone: 'warn',
    });
  });
});
