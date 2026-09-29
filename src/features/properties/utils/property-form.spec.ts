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
      unit_count: 2,
      max_guests: 4,
    };
    expect(validatePropertyForm(values)).toEqual({});
    const property = buildPropertyFromForm(values);
    expect(property.name).toBe('Harbour View');
    expect(property.address.display).toContain('Lagos');
    expect(property.listed).toBe(true);
  });

  it('syncs unit inventory to the requested count', () => {
    const property = buildPropertyFromForm({
      ...createEmptyPropertyForm(),
      name: 'Harbour View',
      line1: '1 Marina',
      city: 'Lagos',
      unit_count: 3,
    });
    const units: Unit[] = [];
    const synced = syncUnitsForProperty(units, property, 3);
    expect(synced).toHaveLength(3);
    expect(synced.every((unit) => unit.property_id === property.id)).toBe(true);

    const reduced = syncUnitsForProperty(synced, property, 1);
    expect(reduced).toHaveLength(1);
  });

  it('preserves id when updating an existing property', () => {
    const existing = {
      id: 99,
      created_at: '2025-01-01T00:00:00Z',
    } as Property;
    const property = buildPropertyFromForm(
      {
        ...createEmptyPropertyForm(),
        name: 'Updated',
        line1: '2 Marina',
        city: 'Lagos',
      },
      existing,
    );
    expect(property.id).toBe(99);
    expect(property.created_at).toBe('2025-01-01T00:00:00Z');
  });
});
