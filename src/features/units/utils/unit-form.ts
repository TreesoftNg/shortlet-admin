import type { Unit } from '@/shared/types/hospitable';

/**
 * Unit form — inventory + facilities from the tenant catalog.
 * Address, long description, and currency inherit from Property.
 */
export type UnitFormValues = {
  property_id: string | '';
  code: string;
  name: string;
  status: Unit['status'];
  bookable: boolean;
  floor: string;
  capacity: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_rate: number | '';
  cleaning_fee: number | '';
  weekly_discount_percent: number | '';
  monthly_discount_percent: number | '';
  facility_ids: string[];
  summary: string;
  notes: string;
  picture: string | null;
};

export type UnitFormErrors = Partial<Record<keyof UnitFormValues, string>>;

export const UNIT_STATUS_OPTIONS: Array<{
  value: Unit['status'];
  label: string;
}> = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
];

export function createEmptyUnitForm(
  defaultPropertyId?: string,
): UnitFormValues {
  return {
    property_id: defaultPropertyId ?? '',
    code: '',
    name: '',
    status: 'active',
    bookable: true,
    floor: '',
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    base_rate: '',
    cleaning_fee: '',
    weekly_discount_percent: '',
    monthly_discount_percent: '',
    facility_ids: [],
    summary: '',
    notes: '',
    picture: null,
  };
}

export function unitToFormValues(unit: Unit): UnitFormValues {
  return {
    property_id: unit.property_id ?? '',
    code: unit.code,
    name: unit.name,
    status: unit.status,
    bookable: unit.bookable,
    floor: unit.floor ?? '',
    capacity: unit.capacity,
    bedrooms: unit.bedrooms,
    beds: unit.beds,
    bathrooms: unit.bathrooms,
    base_rate: unit.base_rate ?? '',
    cleaning_fee: unit.cleaning_fee ?? '',
    weekly_discount_percent: unit.weekly_discount_percent ?? '',
    monthly_discount_percent: unit.monthly_discount_percent ?? '',
    facility_ids: [...unit.facility_ids],
    summary: unit.summary ?? '',
    notes: unit.notes ?? '',
    picture: unit.picture,
  };
}

export function validateUnitForm(values: UnitFormValues): UnitFormErrors {
  const errors: UnitFormErrors = {};

  if (!values.property_id.trim()) {
    errors.property_id = 'Select a property';
  }
  if (!values.code.trim()) errors.code = 'Unit code is required';
  if (!values.name.trim()) errors.name = 'Unit name is required';
  if (!Number.isFinite(values.capacity) || values.capacity < 1) {
    errors.capacity = 'Guest capacity must be at least 1';
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
  if (
    values.base_rate !== '' &&
    (!Number.isFinite(Number(values.base_rate)) || Number(values.base_rate) < 0)
  ) {
    errors.base_rate = 'Base rate must be a valid amount';
  }
  if (
    values.cleaning_fee !== '' &&
    (!Number.isFinite(Number(values.cleaning_fee)) ||
      Number(values.cleaning_fee) < 0)
  ) {
    errors.cleaning_fee = 'Cleaning fee must be a valid amount';
  }
  if (
    values.weekly_discount_percent !== '' &&
    (!Number.isFinite(Number(values.weekly_discount_percent)) ||
      Number(values.weekly_discount_percent) < 0 ||
      Number(values.weekly_discount_percent) > 100)
  ) {
    errors.weekly_discount_percent = 'Weekly discount must be between 0 and 100';
  }
  if (
    values.monthly_discount_percent !== '' &&
    (!Number.isFinite(Number(values.monthly_discount_percent)) ||
      Number(values.monthly_discount_percent) < 0 ||
      Number(values.monthly_discount_percent) > 100)
  ) {
    errors.monthly_discount_percent =
      'Monthly discount must be between 0 and 100';
  }

  return errors;
}

export function formatUnitSubtitle(unit: Pick<Unit, 'bedrooms' | 'floor'>): string {
  const bedsLabel =
    unit.bedrooms === 0
      ? 'Studio'
      : `${unit.bedrooms} bed${unit.bedrooms === 1 ? '' : 's'}`;
  if (!unit.floor) return bedsLabel;
  return `${bedsLabel} · ${unit.floor}`;
}

export function buildUnitFromForm(
  values: UnitFormValues,
  existing?: Unit | null,
  nextId?: string,
  facilityNames: string[] = [],
): Unit {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? nextId ?? '0',
    property_id: values.property_id || null,
    linked_property_name: existing?.linked_property_name ?? null,
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    status: values.status,
    bookable: values.bookable,
    floor: values.floor.trim() || null,
    capacity: values.capacity,
    bedrooms: values.bedrooms,
    beds: values.beds,
    bathrooms: values.bathrooms,
    base_rate: values.base_rate === '' ? null : Number(values.base_rate),
    cleaning_fee:
      values.cleaning_fee === '' ? null : Number(values.cleaning_fee),
    weekly_discount_percent:
      values.weekly_discount_percent === ''
        ? null
        : Number(values.weekly_discount_percent),
    monthly_discount_percent:
      values.monthly_discount_percent === ''
        ? null
        : Number(values.monthly_discount_percent),
    facility_ids: [...values.facility_ids],
    amenities: facilityNames.length
      ? facilityNames
      : existing?.amenities ?? [],
    summary: values.summary.trim() || null,
    notes: values.notes.trim() || null,
    picture: values.picture,
    city: existing?.city ?? null,
    currency: existing?.currency ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
