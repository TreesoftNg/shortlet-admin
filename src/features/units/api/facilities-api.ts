import { fetchActiveFacilities } from '@/features/facilities/api/facilities-service';

export type Facility = {
  id: string;
  name: string;
  category: string | null;
};

/** Active facilities for unit/property pickers (walks pagination). */
export async function fetchFacilities(): Promise<Facility[]> {
  return fetchActiveFacilities();
}
