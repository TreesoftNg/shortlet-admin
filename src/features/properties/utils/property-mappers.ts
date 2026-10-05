import type { Property } from '@/shared/types/hospitable';
import type {
  ApiListingStatus,
  ApiProperty,
  CreatePropertyPayload,
  UpdatePropertyPayload,
} from '../types';
import type { PropertyFormValues } from './property-form';

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function buildDisplay(parts: Array<string | null | undefined>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(', ');
}

/** Map a staging property into the admin Property model. */
export function mapPropertyFromApi(property: ApiProperty): Property {
  const facilities = property.facilities ?? [];
  const facilityIds =
    facilities.length > 0
      ? facilities.map((facility) => facility.id)
      : (property.facilityIds ?? []);
  const amenityLabels = facilities.map((facility) => facility.name);

  const street =
    property.street ??
    property.address?.street ??
    property.address?.line1 ??
    '';
  const line2 = property.line2 ?? property.address?.line2 ?? null;
  const city = property.city ?? property.address?.city ?? '';
  const state = property.state ?? property.address?.state ?? null;
  const zip =
    property.postalCode ??
    property.address?.postalCode ??
    property.address?.zip ??
    null;
  const country = (property.country ?? property.address?.country ?? 'NG').toUpperCase();
  const display =
    property.address?.display?.trim() ||
    buildDisplay([street, city, state, country]);

  const listed = (property.listingStatus ?? 'listed') !== 'unlisted';
  const archived =
    Boolean(property.archivedAt) ||
    property.status === 'archived';

  return {
    id: property.id,
    name: property.name,
    public_name: property.publicName ?? null,
    picture: property.pictureUrl ?? null,
    type: 'entire_home',
    property_type: property.propertyType ?? 'apartment',
    room_type: 'entire_home',
    timezone: property.timezone ?? 'Africa/Lagos',
    listed,
    archived,
    calendar_restricted: false,
    address: {
      line1: street,
      street,
      line2,
      city,
      state,
      zip,
      postcode: zip,
      country,
      display,
      coordinates: null,
    },
    amenities: amenityLabels,
    facility_ids: facilityIds,
    unit_count: toNumber(property.unitCount),
    capacity: {
      max: toNumber(property.guests, 1),
      bedrooms: toNumber(property.bedrooms),
      beds: toNumber(property.beds),
      bathrooms: toNumber(property.bathrooms),
    },
    description: property.description ?? null,
    summary: property.summary ?? null,
    check_in: property.checkInTime ?? null,
    check_out: property.checkOutTime ?? null,
    currency: property.currency ?? 'NGN',
    tags: [],
    created_at: property.createdAt,
    updated_at: property.updatedAt,
    images: property.pictureUrl
      ? [
          {
            id: `${property.id}-cover`,
            url: property.pictureUrl,
            caption: null,
            sort_order: 0,
          },
        ]
      : [],
  };
}

function listingStatusFromForm(listed: boolean): ApiListingStatus {
  return listed ? 'listed' : 'unlisted';
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Only http(s) URLs belong in JSON. Data/blob URLs are local previews;
 * new files are uploaded via POST /cc/properties/:id/cover.
 */
export function publicPictureUrlFromForm(
  values: PropertyFormValues,
): string | null {
  const fromImage = values.images[0]?.url?.trim() ?? '';
  if (isHttpUrl(fromImage)) return fromImage;
  const fromField = values.picture_url?.trim() ?? '';
  if (isHttpUrl(fromField)) return fromField;
  return null;
}

/** Build POST /properties body from the property form. */
export function toCreatePropertyPayload(
  values: PropertyFormValues,
): CreatePropertyPayload {
  const hasPendingCover = values.images.some((image) => Boolean(image.file));

  return {
    name: values.name.trim(),
    publicName: values.public_name.trim() || null,
    propertyType: values.property_type,
    listingStatus: listingStatusFromForm(values.listed),
    street: values.line1.trim(),
    line2: values.line2.trim() || null,
    city: values.city.trim(),
    state: values.state.trim() || null,
    postalCode: values.zip.trim() || null,
    country: values.country.trim().toUpperCase(),
    guests: values.max_guests,
    bedrooms: values.bedrooms,
    beds: values.beds,
    bathrooms: values.bathrooms,
    checkInTime: values.check_in || null,
    checkOutTime: values.check_out || null,
    timezone: values.timezone || null,
    currency: values.currency || null,
    summary: values.summary.trim() || null,
    description: values.description.trim() || null,
    facilityIds: [...values.facility_ids],
    // Pending file is uploaded after create; never send data: URLs.
    pictureUrl: hasPendingCover ? null : publicPictureUrlFromForm(values),
  };
}

/** Build PATCH /properties/:id body from the property form. */
export function toUpdatePropertyPayload(
  values: PropertyFormValues,
): UpdatePropertyPayload {
  const payload = toCreatePropertyPayload(values);
  if (values.images.some((image) => Boolean(image.file))) {
    const { pictureUrl: _pictureUrl, ...rest } = payload;
    return rest;
  }
  return payload;
}
