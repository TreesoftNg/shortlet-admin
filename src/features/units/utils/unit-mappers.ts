import type { Unit } from '@/shared/types/hospitable';
import type {
  ApiUnit,
  ApiUnitStatus,
  CreateUnitPayload,
  UpdateUnitPayload,
} from '../types';
import type { UnitFormValues } from './unit-form';

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapStatusFromApi(status: string): Unit['status'] {
  if (status === 'active' || status === 'maintenance') return status;
  // API uses "closed"; the admin UI labels that as Inactive.
  return 'inactive';
}

export function mapStatusToApi(status: Unit['status']): ApiUnitStatus {
  if (status === 'inactive') return 'closed';
  return status;
}

/** Map a staging unit into the admin Unit model. */
export function mapUnitFromApi(unit: ApiUnit): Unit {
  const facilities = unit.facilities ?? [];
  const facilityIds =
    facilities.length > 0
      ? facilities.map((facility) => facility.id)
      : (unit.facilityIds ?? []);
  const amenityLabels =
    facilities.length > 0
      ? facilities.map((facility) => facility.name)
      : (unit.unitAmenities ?? []);

  const nestedProperty = unit.property;
  const city =
    nestedProperty?.city ??
    nestedProperty?.address?.city ??
    unit.address?.city ??
    null;

  return {
    id: unit.id,
    property_id: unit.propertyId ?? nestedProperty?.id ?? null,
    linked_property_name: nestedProperty?.name ?? null,
    code: unit.code?.trim() ?? '',
    name: unit.name,
    status: mapStatusFromApi(unit.status),
    bookable: Boolean(unit.openForBooking),
    floor: unit.floor,
    capacity: toNumber(unit.guests, 1),
    bedrooms: toNumber(unit.capacityBedrooms),
    beds: toNumber(unit.capacityBeds),
    bathrooms: toNumber(unit.capacityBathrooms),
    base_rate: toNullableNumber(unit.baseNightlyRate),
    cleaning_fee: toNullableNumber(unit.cleaningFee),
    weekly_discount_percent: toNullableNumber(unit.weeklyDiscountPercent),
    monthly_discount_percent: toNullableNumber(unit.monthlyDiscountPercent),
    facility_ids: facilityIds,
    amenities: amenityLabels,
    summary: unit.summary,
    notes: unit.internalNotes ?? null,
    picture: unit.pictureUrl,
    city,
    currency: nestedProperty?.currency ?? unit.currency ?? null,
    created_at: unit.createdAt,
    updated_at: unit.updatedAt,
  };
}

function optionalAmount(value: number | ''): number | null {
  return value === '' ? null : Number(value);
}

/** Build POST /units body from the unit form. */
export function toCreateUnitPayload(values: UnitFormValues): CreateUnitPayload {
  return {
    propertyId: String(values.property_id),
    status: mapStatusToApi(values.status),
    code: values.code.trim(),
    name: values.name.trim(),
    floor: values.floor.trim() || null,
    summary: values.summary.trim() || null,
    openForBooking: values.bookable,
    guests: values.capacity,
    capacityBedrooms: values.bedrooms,
    capacityBeds: values.beds,
    capacityBathrooms: values.bathrooms,
    facilityIds: [...values.facility_ids],
    baseNightlyRate: optionalAmount(values.base_rate),
    cleaningFee: optionalAmount(values.cleaning_fee),
    weeklyDiscountPercent: optionalAmount(values.weekly_discount_percent),
    monthlyDiscountPercent: optionalAmount(values.monthly_discount_percent),
    internalNotes: values.notes.trim() || null,
    pictureUrl: values.picture,
  };
}

/** Build PATCH /units/:id body from the unit form. */
export function toUpdateUnitPayload(values: UnitFormValues): UpdateUnitPayload {
  return toCreateUnitPayload(values);
}
