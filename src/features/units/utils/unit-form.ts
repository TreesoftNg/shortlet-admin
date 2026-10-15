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
  /** Empty follows the business booking settings. */
  min_nights: number | '';
  max_nights: number | '';
  facility_ids: string[];
  summary: string;
  notes: string;
  picture: string | null;
};

export type UnitFormErrors = Partial<Record<keyof UnitFormValues, string>>;

/** Whole-number range the API accepts for a unit's shortest and longest stay. */
export const STAY_NIGHTS_LIMIT = { min: 1, max: 366 } as const;

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
    min_nights: '',
    max_nights: '',
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
    min_nights: unit.min_nights ?? '',
    max_nights: unit.max_nights ?? '',
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

  const isStayLength = (value: number) =>
    Number.isInteger(value) &&
    value >= STAY_NIGHTS_LIMIT.min &&
    value <= STAY_NIGHTS_LIMIT.max;
  const stayLengthRange = `a whole number from ${STAY_NIGHTS_LIMIT.min} to ${STAY_NIGHTS_LIMIT.max}`;
  if (values.min_nights !== '' && !isStayLength(Number(values.min_nights))) {
    errors.min_nights = `Minimum nights must be ${stayLengthRange}`;
  }
  if (values.max_nights !== '' && !isStayLength(Number(values.max_nights))) {
    errors.max_nights = `Maximum nights must be ${stayLengthRange}`;
  } else if (
    values.max_nights !== '' &&
    values.min_nights !== '' &&
    !errors.min_nights &&
    Number(values.max_nights) < Number(values.min_nights)
  ) {
    errors.max_nights = 'Maximum nights must be at least the minimum nights';
  }

  return errors;
}

/** "1 night", "3 nights". */
export function formatNights(nights: number): string {
  return `${nights} night${nights === 1 ? '' : 's'}`;
}

/** A business stay limit in words; null means there is no limit. */
function formatBusinessNights(nights: number | null): string {
  return nights === null ? 'no limit' : formatNights(nights);
}

/**
 * Placeholder for a stay length left empty, e.g. "Business default · 3 nights".
 * `businessNights` is undefined while the business settings load.
 */
export function businessDefaultPlaceholder(
  businessNights: number | null | undefined,
): string {
  return businessNights === undefined
    ? 'Business default'
    : `Business default · ${formatBusinessNights(businessNights)}`;
}

/**
 * A unit's stay length for display: its own value, or the business default it
 * follows, e.g. "Business default (no limit)".
 */
export function formatUnitStayLength(
  unitNights: number | null,
  businessNights: number | null | undefined,
): string {
  if (unitNights !== null) return formatNights(unitNights);
  return businessNights === undefined
    ? 'Business default'
    : `Business default (${formatBusinessNights(businessNights)})`;
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
    min_nights: values.min_nights === '' ? null : Number(values.min_nights),
    max_nights: values.max_nights === '' ? null : Number(values.max_nights),
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
