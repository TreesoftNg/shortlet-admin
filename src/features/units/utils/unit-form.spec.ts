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

  it('builds unit payload with facility ids', () => {
    const unit = buildUnitFromForm(
      {
        ...createEmptyUnitForm('1'),
        property_id: '1',
        code: 'd',
        name: 'Unit D',
        floor: '4th floor',
        capacity: 3,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        base_rate: 90000,
        cleaning_fee: 12000,
        weekly_discount_percent: 5,
        monthly_discount_percent: 15,
        bookable: true,
        facility_ids: ['fac-wifi', 'fac-desk'],
        summary: 'Quiet corner unit',
        notes: 'Prefer midweek only',
      },
      null,
      '12',
      ['Wi-Fi', 'Workspace'],
    );
    expect(unit.id).toBe('12');
    expect(unit.code).toBe('D');
    expect(unit.floor).toBe('4th floor');
    expect(unit.base_rate).toBe(90000);
    expect(unit.cleaning_fee).toBe(12000);
    expect(unit.facility_ids).toEqual(['fac-wifi', 'fac-desk']);
    expect(unit.amenities).toEqual(['Wi-Fi', 'Workspace']);
    expect(formatUnitSubtitle(unit)).toBe('1 bed · 4th floor');
  });

  it('preserves id when updating', () => {
    const existing = {
      id: '5',
      created_at: '2025-01-01T00:00:00Z',
      facility_ids: [],
      amenities: [],
    } as unknown as Unit;
    const unit = buildUnitFromForm(
      {
        ...createEmptyUnitForm('2'),
        property_id: '2',
        code: 'S3',
        name: 'Studio 3',
        capacity: 2,
        status: 'inactive',
        bookable: false,
      },
      existing,
    );
    expect(unit.id).toBe('5');
    expect(unit.created_at).toBe('2025-01-01T00:00:00Z');
    expect(unit.bookable).toBe(false);
  });
});
