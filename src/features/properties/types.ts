/** Raw shapes from GET/POST/PATCH/DELETE /api/v1/cc/properties. */

export type ApiListingStatus = 'listed' | 'unlisted';

export type ApiPropertyFacility = {
  id: string;
  name: string;
  category?: string | null;
};

export type ApiProperty = {
  id: string;
  name: string;
  publicName?: string | null;
  propertyType?: string | null;
  listingStatus?: ApiListingStatus | string | null;
  street?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  guests?: number | null;
  bedrooms?: number | null;
  beds?: number | null;
  bathrooms?: number | string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  timezone?: string | null;
  currency?: string | null;
  summary?: string | null;
  description?: string | null;
  pictureUrl?: string | null;
  facilities?: ApiPropertyFacility[] | null;
  facilityIds?: string[] | null;
  unitCount?: number | null;
  status?: string | null;
  archivedAt?: string | null;
  address?: {
    street?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    zip?: string | null;
    country?: string | null;
    display?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePropertyPayload = {
  name: string;
  publicName?: string | null;
  propertyType?: string;
  listingStatus?: ApiListingStatus;
  street: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  guests: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  timezone?: string | null;
  currency?: string | null;
  summary?: string | null;
  description?: string | null;
  facilityIds?: string[];
  pictureUrl?: string | null;
};

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;
