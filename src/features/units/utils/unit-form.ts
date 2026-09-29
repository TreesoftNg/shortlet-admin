import type { Unit } from '@/shared/types/hospitable';

/**
 * Unit form — inventory fields only.
 * Address, amenities, long description, and currency inherit from Property.
 */
export type UnitFormValues = {
  property_id: number | '';
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
  defaultPropertyId?: number,
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
    summary: '',
    notes: '',
    picture: null,
  };
}

export function unitToFormValues(unit: Unit): UnitFormValues {
  return {
    property_id: unit.property_id,
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
    summary: unit.summary ?? '',
    notes: unit.notes ?? '',
    picture: unit.picture,
  };
}

export function validateUnitForm(values: UnitFormValues): UnitFormErrors {
  const errors: UnitFormErrors = {};

  if (values.property_id === '' || !Number.isFinite(Number(values.property_id))) {
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
  nextId?: number,
): Unit {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? nextId ?? 0,
    property_id: Number(values.property_id),
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
    summary: values.summary.trim() || null,
    notes: values.notes.trim() || null,
    picture: values.picture,
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
