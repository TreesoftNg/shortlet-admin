/** Raw shape from GET/POST/PATCH/DELETE /api/v1/cc/facilities. */

export type FacilityStatus = 'active' | 'archived';

export type ApiFacility = {
  id: string;
  name: string;
  category: string | null;
  status: FacilityStatus;
};

export type Facility = {
  id: string;
  name: string;
  category: string | null;
  status: FacilityStatus;
};

export type FacilityInput = {
  name: string;
  category?: string | null;
};
