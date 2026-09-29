import {
  buildUnitFromForm,
  createEmptyUnitForm,
  formatUnitSubtitle,
  validateUnitForm,
} from './unit-form';
import type { Unit } from '@/shared/types/hospitable';

describe('unit-form utils', () => {
  it('requires property, code, and name', () => {
    const errors = validateUnitForm(createEmptyUnitForm());
    expect(errors.property_id).toBeTruthy();
    expect(errors.code).toBeTruthy();
    expect(errors.name).toBeTruthy();
  });

  it('builds inventory-only unit payload', () => {
    const unit = buildUnitFromForm(
      {
        ...createEmptyUnitForm(1),
        property_id: 1,
        code: 'd',
        name: 'Unit D',
        floor: '4th floor',
        capacity: 3,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        base_rate: 90000,
        bookable: true,
        summary: 'Quiet corner unit',
        notes: 'Prefer midweek only',
      },
      null,
      12,
    );
    expect(unit.id).toBe(12);
    expect(unit.code).toBe('D');
    expect(unit.floor).toBe('4th floor');
    expect(unit.base_rate).toBe(90000);
    expect(formatUnitSubtitle(unit)).toBe('1 bed · 4th floor');
    expect(unit).not.toHaveProperty('amenities');
    expect(unit).not.toHaveProperty('description');
    expect(unit).not.toHaveProperty('currency');
  });

  it('preserves id when updating', () => {
    const existing = {
      id: 5,
      created_at: '2025-01-01T00:00:00Z',
    } as Unit;
    const unit = buildUnitFromForm(
      {
        ...createEmptyUnitForm(2),
        property_id: 2,
        code: 'S3',
        name: 'Studio 3',
        capacity: 2,
        status: 'inactive',
        bookable: false,
      },
      existing,
    );
    expect(unit.id).toBe(5);
    expect(unit.created_at).toBe('2025-01-01T00:00:00Z');
    expect(unit.bookable).toBe(false);
  });
});
