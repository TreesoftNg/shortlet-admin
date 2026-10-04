/** Raw shapes from GET/POST/PATCH /api/v1/cc/units and /api/v1/cc/facilities. */

export type ApiUnitStatus = 'active' | 'maintenance' | 'closed';

export type ApiUnitAddress = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  street?: string | null;
  line2?: string | null;
};

export type ApiFacility = {
  id: string;
  name: string;
  category?: string | null;
  status?: string;
};

export type ApiUnitProperty = {
  id: string;
  name: string;
  publicName?: string | null;
  city?: string | null;
  currency?: string | null;
  amenities?: string[] | null;
  facilities?: ApiFacility[] | null;
  address?: ApiUnitAddress | null;
};

export type ApiUnit = {
  id: string;
  tenantId?: string;
  propertyId: string | null;
  property?: ApiUnitProperty | null;
  code: string | null;
  name: string;
  floor: string | null;
  summary: string | null;
  publicName?: string | null;
  pictureUrl: string | null;
  openForBooking: boolean;
  guests: number;
  capacityBedrooms?: number | null;
  capacityBeds?: number | null;
  capacityBathrooms?: number | string | null;
  address?: ApiUnitAddress | null;
  /** Embedded facility rows on GET unit / list. */
  facilities?: ApiFacility[] | null;
  /** Some list payloads may only return ids. */
  facilityIds?: string[] | null;
  /** @deprecated older staging payloads used string labels. */
  unitAmenities?: string[] | null;
  internalNotes?: string | null;
  baseNightlyRate?: number | null;
  cleaningFee?: number | null;
  weeklyDiscountPercent?: number | null;
  monthlyDiscountPercent?: number | null;
  currency?: string | null;
  status: ApiUnitStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUnitPayload = {
  propertyId: string;
  status: ApiUnitStatus;
  code: string;
  name: string;
  floor?: string | null;
  summary?: string | null;
  openForBooking?: boolean;
  guests: number;
  capacityBedrooms?: number;
  capacityBeds?: number;
  capacityBathrooms?: number;
  facilityIds?: string[];
  baseNightlyRate?: number | null;
  cleaningFee?: number | null;
  weeklyDiscountPercent?: number | null;
  monthlyDiscountPercent?: number | null;
  internalNotes?: string | null;
  pictureUrl?: string | null;
};

export type UpdateUnitPayload = Partial<CreateUnitPayload>;
