import {
  buildPropertyFromForm,
  createEmptyPropertyForm,
  syncUnitsForProperty,
  validatePropertyForm,
  type PropertyFormValues,
} from './property-form';
import type { Property, Unit } from '@/shared/types/hospitable';

describe('property-form utils', () => {
  it('requires core fields', () => {
    const errors = validatePropertyForm(createEmptyPropertyForm());
    expect(errors.name).toBeTruthy();
    expect(errors.line1).toBeTruthy();
    expect(errors.city).toBeTruthy();
  });

  it('builds a property from valid form values', () => {
    const values: PropertyFormValues = {
      ...createEmptyPropertyForm(),
      name: 'Harbour View',
      line1: '1 Marina',
      city: 'Lagos',
      max_guests: 4,
      facility_ids: ['fac-1'],
    };
    expect(validatePropertyForm(values)).toEqual({});
    const property = buildPropertyFromForm(values, null, '12', ['Wi-Fi']);
    expect(property.id).toBe('12');
    expect(property.name).toBe('Harbour View');
    expect(property.address.display).toContain('Lagos');
    expect(property.listed).toBe(true);
    expect(property.facility_ids).toEqual(['fac-1']);
    expect(property.amenities).toEqual(['Wi-Fi']);
  });

  it('syncs unit inventory to the requested count', () => {
    const property = buildPropertyFromForm({
      ...createEmptyPropertyForm(),
      name: 'Harbour View',
      line1: '1 Marina',
      city: 'Lagos',
    });
    const units: Unit[] = [];
    const synced = syncUnitsForProperty(units, property, 3);
    expect(synced).toHaveLength(3);
    expect(synced.every((unit) => unit.property_id === String(property.id))).toBe(
      true,
    );

    const reduced = syncUnitsForProperty(synced, property, 1);
    expect(reduced).toHaveLength(1);
  });

  it('preserves id when updating an existing property', () => {
    const existing = {
      id: '99',
      created_at: '2025-01-01T00:00:00Z',
      facility_ids: [],
      amenities: [],
      unit_count: 0,
      archived: false,
    } as unknown as Property;
    const property = buildPropertyFromForm(
      {
        ...createEmptyPropertyForm(),
        name: 'Updated',
        line1: '2 Marina',
        city: 'Lagos',
      },
      existing,
    );
    expect(property.id).toBe('99');
    expect(property.created_at).toBe('2025-01-01T00:00:00Z');
  });
});
