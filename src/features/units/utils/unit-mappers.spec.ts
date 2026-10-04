import type { ApiUnit } from '../types';
import {
  mapStatusFromApi,
  mapStatusToApi,
  mapUnitFromApi,
  toCreateUnitPayload,
  toUpdateUnitPayload,
} from './unit-mappers';
import { createEmptyUnitForm } from './unit-form';

const sampleApiUnit: ApiUnit = {
  id: 'd04c29d1-3143-46a0-b636-825da1d2cce5',
  propertyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  property: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
    name: 'Azure Lekki',
    city: 'Lekki',
    currency: 'NGN',
  },
  code: 'A',
  name: 'Charming 1bedroom with outdoor furniture',
  floor: '3rd floor',
  summary: 'Bright lagoon view',
  pictureUrl: 'https://images.com/unit-a.jpg',
  openForBooking: true,
  guests: 2,
  capacityBedrooms: 1,
  capacityBeds: 1,
  capacityBathrooms: '1.0',
  address: { city: 'Lagos', state: 'Lagos', country: 'NG' },
  facilities: [
    { id: 'fac-wifi', name: 'Wi-Fi', category: 'Essentials' },
    { id: 'fac-parking', name: 'Parking', category: 'Parking' },
  ],
  cleaningFee: 15000,
  weeklyDiscountPercent: 10,
  monthlyDiscountPercent: 20,
  internalNotes: 'Preferred for longer stays.',
  baseNightlyRate: 95000,
  currency: 'NGN',
  status: 'active',
  createdAt: '2026-10-01T17:05:18.022Z',
  updatedAt: '2026-10-01T17:05:18.022Z',
};

describe('unit mappers', () => {
  it('maps staging units with facilities, fees, and property', () => {
    const unit = mapUnitFromApi(sampleApiUnit);
    expect(unit.id).toBe(sampleApiUnit.id);
    expect(unit.property_id).toBe(sampleApiUnit.propertyId);
    expect(unit.linked_property_name).toBe('Azure Lekki');
    expect(unit.code).toBe('A');
    expect(unit.capacity).toBe(2);
    expect(unit.bathrooms).toBe(1);
    expect(unit.city).toBe('Lekki');
    expect(unit.facility_ids).toEqual(['fac-wifi', 'fac-parking']);
    expect(unit.amenities).toEqual(['Wi-Fi', 'Parking']);
    expect(unit.cleaning_fee).toBe(15000);
    expect(unit.weekly_discount_percent).toBe(10);
    expect(unit.monthly_discount_percent).toBe(20);
    expect(unit.base_rate).toBe(95000);
    expect(unit.bookable).toBe(true);
  });

  it('maps closed status to inactive in the UI', () => {
    expect(mapStatusFromApi('closed')).toBe('inactive');
    expect(mapStatusToApi('inactive')).toBe('closed');
  });

  it('builds create payloads with facilityIds and fee fields', () => {
    const payload = toCreateUnitPayload({
      ...createEmptyUnitForm('prop-1'),
      property_id: 'prop-1',
      code: 'A',
      name: 'Unit A',
      status: 'inactive',
      bookable: false,
      capacity: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      base_rate: 95000,
      cleaning_fee: 15000,
      weekly_discount_percent: 10,
      monthly_discount_percent: 20,
      facility_ids: ['fac-wifi'],
      summary: 'Bright',
      notes: 'Ops note',
      picture: 'https://images.com/a.jpg',
    });
    expect(payload).toEqual({
      propertyId: 'prop-1',
      status: 'closed',
      code: 'A',
      name: 'Unit A',
      floor: null,
      summary: 'Bright',
      openForBooking: false,
      guests: 4,
      capacityBedrooms: 2,
      capacityBeds: 2,
      capacityBathrooms: 2,
      facilityIds: ['fac-wifi'],
      baseNightlyRate: 95000,
      cleaningFee: 15000,
      weeklyDiscountPercent: 10,
      monthlyDiscountPercent: 20,
      internalNotes: 'Ops note',
      pictureUrl: 'https://images.com/a.jpg',
    });
  });

  it('omits pictureUrl on update so the gallery owns the cover', () => {
    const payload = toUpdateUnitPayload({
      ...createEmptyUnitForm('prop-1'),
      property_id: 'prop-1',
      code: 'A',
      name: 'Unit A',
      picture: 'https://images.com/stale.jpg',
    });
    expect(payload.pictureUrl).toBeUndefined();
    expect(payload.code).toBe('A');
  });
});
