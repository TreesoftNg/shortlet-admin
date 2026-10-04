import type { ApiProperty } from '../types';
import {
  mapPropertyFromApi,
  toCreatePropertyPayload,
} from './property-mappers';
import { createEmptyPropertyForm } from './property-form';

const sample: ApiProperty = {
  id: 'prop-1',
  name: 'Azure Lekki',
  publicName: 'Azure Lekki Residences',
  propertyType: 'apartment',
  listingStatus: 'listed',
  street: '12 Admiralty Way',
  line2: null,
  city: 'Lekki',
  state: 'Lagos',
  postalCode: '105102',
  country: 'NG',
  guests: 4,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  checkInTime: '14:00',
  checkOutTime: '11:00',
  timezone: 'Africa/Lagos',
  currency: 'NGN',
  summary: 'Waterfront shortlet',
  description: 'Bright apartment',
  pictureUrl: 'https://images.com/cover.jpg',
  facilities: [
    { id: 'fac-wifi', name: 'Wi-Fi', category: 'Essentials' },
    { id: 'fac-pool', name: 'Pool', category: 'Outdoor' },
  ],
  unitCount: 3,
  status: 'active',
  archivedAt: null,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-02T10:00:00.000Z',
};

describe('property mappers', () => {
  it('maps staging properties into the admin model', () => {
    const property = mapPropertyFromApi(sample);
    expect(property.id).toBe('prop-1');
    expect(property.public_name).toBe('Azure Lekki Residences');
    expect(property.listed).toBe(true);
    expect(property.archived).toBe(false);
    expect(property.address.line1).toBe('12 Admiralty Way');
    expect(property.address.city).toBe('Lekki');
    expect(property.capacity.max).toBe(4);
    expect(property.facility_ids).toEqual(['fac-wifi', 'fac-pool']);
    expect(property.amenities).toEqual(['Wi-Fi', 'Pool']);
    expect(property.unit_count).toBe(3);
    expect(property.picture).toBe('https://images.com/cover.jpg');
  });

  it('maps archived status', () => {
    const property = mapPropertyFromApi({
      ...sample,
      status: 'archived',
      archivedAt: '2026-10-03T00:00:00.000Z',
      listingStatus: 'unlisted',
    });
    expect(property.archived).toBe(true);
    expect(property.listed).toBe(false);
  });

  it('builds create payloads with facilityIds', () => {
    const payload = toCreatePropertyPayload({
      ...createEmptyPropertyForm(),
      name: 'Azure Lekki',
      public_name: 'Azure Lekki Residences',
      property_type: 'apartment',
      listed: false,
      line1: '12 Admiralty Way',
      city: 'Lekki',
      state: 'Lagos',
      zip: '105102',
      country: 'ng',
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      facility_ids: ['fac-wifi'],
      summary: 'Short summary',
      description: 'Long description',
      picture_url: 'https://images.com/cover.jpg',
    });

    expect(payload).toEqual({
      name: 'Azure Lekki',
      publicName: 'Azure Lekki Residences',
      propertyType: 'apartment',
      listingStatus: 'unlisted',
      street: '12 Admiralty Way',
      line2: null,
      city: 'Lekki',
      state: 'Lagos',
      postalCode: '105102',
      country: 'NG',
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      timezone: 'Africa/Lagos',
      currency: 'NGN',
      summary: 'Short summary',
      description: 'Long description',
      facilityIds: ['fac-wifi'],
      pictureUrl: 'https://images.com/cover.jpg',
    });
  });
});
