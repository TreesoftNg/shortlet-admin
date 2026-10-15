import {
  buildUnitFromForm,
  businessDefaultPlaceholder,
  createEmptyUnitForm,
  formatNights,
  formatUnitStayLength,
  formatUnitSubtitle,
  unitToFormValues,
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

describe('unit stay lengths', () => {
  const validUnit = {
    ...createEmptyUnitForm('1'),
    code: 'A',
    name: 'Unit A',
  };

  it('starts empty, following the business default', () => {
    expect(createEmptyUnitForm()).toMatchObject({ min_nights: '', max_nights: '' });
    expect(validateUnitForm(validUnit)).toEqual({});
  });

  it('round-trips own values and the business default', () => {
    const own = buildUnitFromForm({ ...validUnit, min_nights: 2, max_nights: 30 });
    expect(own).toMatchObject({ min_nights: 2, max_nights: 30 });
    expect(unitToFormValues(own)).toMatchObject({ min_nights: 2, max_nights: 30 });

    const following = buildUnitFromForm(validUnit);
    expect(following).toMatchObject({ min_nights: null, max_nights: null });
    expect(unitToFormValues(following)).toMatchObject({ min_nights: '', max_nights: '' });
  });

  it('accepts whole numbers from 1 to 366', () => {
    expect(validateUnitForm({ ...validUnit, min_nights: 1, max_nights: 366 })).toEqual({});
    expect(validateUnitForm({ ...validUnit, min_nights: 0, max_nights: 367 })).toEqual({
      min_nights: 'Minimum nights must be a whole number from 1 to 366',
      max_nights: 'Maximum nights must be a whole number from 1 to 366',
    });
    expect(validateUnitForm({ ...validUnit, min_nights: 1.5 }).min_nights).toBe(
      'Minimum nights must be a whole number from 1 to 366',
    );
  });

  it('needs the maximum to be at least the minimum when both are set', () => {
    expect(validateUnitForm({ ...validUnit, min_nights: 5, max_nights: 4 })).toEqual({
      max_nights: 'Maximum nights must be at least the minimum nights',
    });
    expect(validateUnitForm({ ...validUnit, min_nights: 5, max_nights: 5 })).toEqual({});
    // Only one side set: the other follows the business default.
    expect(validateUnitForm({ ...validUnit, max_nights: 2 })).toEqual({});
    expect(validateUnitForm({ ...validUnit, min_nights: 0, max_nights: 4 })).toEqual({
      min_nights: 'Minimum nights must be a whole number from 1 to 366',
    });
  });

  it('describes nights and business defaults', () => {
    expect(formatNights(1)).toBe('1 night');
    expect(formatNights(3)).toBe('3 nights');
    expect(businessDefaultPlaceholder(undefined)).toBe('Business default');
    expect(businessDefaultPlaceholder(1)).toBe('Business default · 1 night');
    expect(businessDefaultPlaceholder(3)).toBe('Business default · 3 nights');
    expect(businessDefaultPlaceholder(null)).toBe('Business default · no limit');
    expect(formatUnitStayLength(3, 1)).toBe('3 nights');
    expect(formatUnitStayLength(null, 1)).toBe('Business default (1 night)');
    expect(formatUnitStayLength(null, null)).toBe('Business default (no limit)');
    expect(formatUnitStayLength(null, undefined)).toBe('Business default');
  });
});
