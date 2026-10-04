import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { ApiFacility } from '../types';

export type Facility = {
  id: string;
  name: string;
  category: string | null;
};

function mapFacility(row: ApiFacility): Facility {
  return {
    id: row.id,
    name: row.name,
    category: typeof row.category === 'string' ? row.category : null,
  };
}

/** Active facilities for unit/property pickers (walks pagination). */
export async function fetchFacilities(): Promise<Facility[]> {
  const limit = 100;
  let page = 1;
  const all: Facility[] = [];

  for (;;) {
    const response = await apiClient<ApiFacility[]>(
      adminPath(`/facilities?status=active&page=${page}&limit=${limit}`),
    );
    all.push(...response.data.map(mapFacility));
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all.sort((a, b) => a.name.localeCompare(b.name));
}
