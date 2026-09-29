import type { Property, PropertyImage, Unit } from '@/shared/types/hospitable';

export type PropertyImageDraft = {
  id: string;
  url: string;
  caption: string;
  sort_order: number;
};

export type PropertyFormValues = {
  name: string;
  public_name: string;
  property_type: string;
  listed: boolean;
  unit_count: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  check_in: string;
  check_out: string;
  timezone: string;
  currency: string;
  summary: string;
  description: string;
  amenities: string[];
  images: PropertyImageDraft[];
};

export type PropertyFormErrors = Partial<
  Record<keyof PropertyFormValues, string>
>;

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'duplex', label: 'Duplex' },
] as const;

export const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'Wi‑Fi' },
  { value: 'parking', label: 'Parking' },
  { value: 'air_conditioning', label: 'Air conditioning' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'pool', label: 'Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'generator', label: 'Generator' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'washer', label: 'Washer' },
  { value: 'workspace', label: 'Workspace' },
] as const;

export const TIMEZONE_OPTIONS = [
  'Africa/Lagos',
  'Africa/Accra',
  'UTC',
] as const;

export const CURRENCY_OPTIONS = ['NGN', 'USD', 'GBP', 'EUR'] as const;

export function createEmptyPropertyForm(): PropertyFormValues {
  return {
    name: '',
    public_name: '',
    property_type: 'apartment',
    listed: true,
    unit_count: 1,
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'NG',
    max_guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    check_in: '14:00',
    check_out: '11:00',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    summary: '',
    description: '',
    amenities: ['wifi'],
    images: [],
  };
}

export function propertyToFormValues(
  property: Property,
  unitCount: number,
): PropertyFormValues {
  return {
    name: property.name,
    public_name: property.public_name ?? '',
    property_type: property.property_type,
    listed: property.listed,
    unit_count: Math.max(unitCount, 1),
    line1: property.address.line1 ?? property.address.street ?? '',
    line2: property.address.line2 ?? '',
    city: property.address.city,
    state: property.address.state ?? '',
    zip: property.address.zip ?? property.address.postcode ?? '',
    country: property.address.country || 'NG',
    max_guests: property.capacity.max,
    bedrooms: property.capacity.bedrooms,
    beds: property.capacity.beds,
    bathrooms: property.capacity.bathrooms,
    check_in: property.check_in ?? '14:00',
    check_out: property.check_out ?? '11:00',
    timezone: property.timezone || 'Africa/Lagos',
    currency: property.currency || 'NGN',
    summary: property.summary ?? '',
    description: property.description ?? '',
    amenities: [...property.amenities],
    images: (property.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      caption: image.caption ?? '',
      sort_order: image.sort_order,
    })),
  };
}

export function validatePropertyForm(
  values: PropertyFormValues,
): PropertyFormErrors {
  const errors: PropertyFormErrors = {};

  if (!values.name.trim()) errors.name = 'Property name is required';
  if (!values.line1.trim()) errors.line1 = 'Street address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.country.trim()) errors.country = 'Country is required';
  if (!Number.isFinite(values.unit_count) || values.unit_count < 1) {
    errors.unit_count = 'At least 1 unit is required';
  }
  if (!Number.isFinite(values.max_guests) || values.max_guests < 1) {
    errors.max_guests = 'Guest capacity must be at least 1';
  }
  if (!Number.isFinite(values.bedrooms) || values.bedrooms < 0) {
    errors.bedrooms = 'Bedrooms cannot be negative';
  }
  if (!Number.isFinite(values.beds) || values.beds < 0) {
    errors.beds = 'Beds cannot be negative';
  }
  if (!Number.isFinite(values.bathrooms) || values.bathrooms < 0) {
    errors.bathrooms = 'Bathrooms cannot be negative';
  }

  return errors;
}

export function buildAddressDisplay(values: PropertyFormValues): string {
  return [values.line1, values.city, values.state].filter(Boolean).join(', ');
}

export function formValuesToPropertyImages(
  images: PropertyImageDraft[],
): PropertyImage[] {
  return images.map((image, index) => ({
    id: image.id,
    url: image.url,
    caption: image.caption.trim() || null,
    sort_order: index,
  }));
}

export function buildPropertyFromForm(
  values: PropertyFormValues,
  existing?: Property | null,
): Property {
  const now = new Date().toISOString();
  const images = formValuesToPropertyImages(values.images);
  const picture = images[0]?.url ?? existing?.picture ?? null;
  const display = buildAddressDisplay(values);

  return {
    id: existing?.id ?? `prop-${Date.now()}`,
    name: values.name.trim(),
    public_name: values.public_name.trim() || null,
    picture,
    type: 'entire_home',
    property_type: values.property_type,
    room_type: 'entire_home',
    timezone: values.timezone,
    listed: values.listed,
    calendar_restricted: existing?.calendar_restricted ?? false,
    address: {
      line1: values.line1.trim(),
      line2: values.line2.trim() || null,
      city: values.city.trim(),
      state: values.state.trim() || null,
      zip: values.zip.trim() || null,
      country: values.country.trim().toUpperCase(),
      display,
      coordinates: existing?.address?.coordinates ?? null,
    },
    amenities: [...values.amenities],
    capacity: {
      max: values.max_guests,
      bedrooms: values.bedrooms,
      beds: values.beds,
      bathrooms: values.bathrooms,
    },
    description: values.description.trim() || null,
    summary: values.summary.trim() || null,
    check_in: values.check_in || null,
    check_out: values.check_out || null,
    currency: values.currency,
    tags: existing?.tags ?? [],
    created_at: existing?.created_at ?? now,
    updated_at: now,
    listings: existing?.listings,
    images,
  };
}

export function unitCodeForIndex(index: number): string {
  if (index < 26) return String.fromCharCode(65 + index);
  return `U${index + 1}`;
}

export function syncUnitsForProperty(
  units: Unit[],
  property: Property,
  unitCount: number,
): Unit[] {
  const now = new Date().toISOString();
  const existing = units.filter((unit) => unit.property_id === property.id);
  const others = units.filter((unit) => unit.property_id !== property.id);
  const nextCount = Math.max(1, Math.floor(unitCount));
  const kept = existing.slice(0, nextCount).map((unit, index) => ({
    ...unit,
    code: unit.code || unitCodeForIndex(index),
    name: unit.name || `Unit ${unitCodeForIndex(index)}`,
    capacity: property.capacity.max,
    picture: property.picture,
    updated_at: now,
  }));

  while (kept.length < nextCount) {
    const index = kept.length;
    const code = unitCodeForIndex(index);
    kept.push({
      id: `unit-${property.id}-${code.toLowerCase()}-${Date.now()}-${index}`,
      property_id: property.id,
      code,
      name: `Unit ${code}`,
      capacity: property.capacity.max,
      status: 'active',
      picture: property.picture,
      created_at: now,
      updated_at: now,
    });
  }

  return [...others, ...kept];
}

export function readFilesAsImageDrafts(
  files: FileList | File[],
): Promise<PropertyImageDraft[]> {
  const list = Array.from(files).filter((file) => file.type.startsWith('image/'));

  return Promise.all(
    list.map(
      (file, index) =>
        new Promise<PropertyImageDraft>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `img-local-${Date.now()}-${index}`,
              url: String(reader.result ?? ''),
              caption: file.name.replace(/\.[^.]+$/, ''),
              sort_order: index,
            });
          };
          reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
          reader.readAsDataURL(file);
        }),
    ),
  );
}
