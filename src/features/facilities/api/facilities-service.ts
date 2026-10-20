import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { ApiFacility, Facility, FacilityInput } from '../types';

function mapFacility(row: ApiFacility): Facility {
  return {
    id: row.id,
    name: row.name,
    category: typeof row.category === 'string' ? row.category : null,
    status: row.status === 'archived' ? 'archived' : 'active',
  };
}

async function fetchFacilityPages(
  status: 'active' | 'archived' | 'all',
): Promise<Facility[]> {
  const limit = 100;
  let page = 1;
  const all: Facility[] = [];

  for (;;) {
    const response = await apiClient<ApiFacility[]>(
      adminPath(`/facilities?status=${status}&page=${page}&limit=${limit}`),
    );
    all.push(...response.data.map(mapFacility));
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all;
}

/** Active + archived, name order — for the catalog page. */
export async function fetchFacilityCatalog(): Promise<Facility[]> {
  const [active, archived] = await Promise.all([
    fetchFacilityPages('active'),
    fetchFacilityPages('archived'),
  ]);
  return [...active, ...archived].sort((a, b) => a.name.localeCompare(b.name));
}

/** Active facilities only — for unit/property pickers. */
export async function fetchActiveFacilities(): Promise<
  Array<Pick<Facility, 'id' | 'name' | 'category'>>
> {
  const rows = await fetchFacilityPages('active');
  return rows
    .map(({ id, name, category }) => ({ id, name, category }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** POST /cc/facilities */
export async function createFacility(input: FacilityInput): Promise<Facility> {
  const response = await apiClient<ApiFacility>(adminPath('/facilities'), {
    method: 'POST',
    body: {
      name: input.name,
      category: input.category?.trim() ? input.category.trim() : null,
    },
  });
  return mapFacility(response.data);
}

/** PATCH /cc/facilities/:id */
export async function updateFacility(
  id: string,
  input: FacilityInput,
): Promise<Facility> {
  const response = await apiClient<ApiFacility>(
    adminPath(`/facilities/${encodeURIComponent(id)}`),
    {
      method: 'PATCH',
      body: {
        name: input.name,
        category: input.category?.trim() ? input.category.trim() : null,
      },
    },
  );
  return mapFacility(response.data);
}

/** DELETE /cc/facilities/:id — soft archive. */
export async function archiveFacility(id: string): Promise<Facility> {
  const response = await apiClient<ApiFacility>(
    adminPath(`/facilities/${encodeURIComponent(id)}`),
    { method: 'DELETE' },
  );
  return mapFacility(response.data);
}

/** POST /cc/facilities/:id/restore */
export async function restoreFacility(id: string): Promise<Facility> {
  const response = await apiClient<ApiFacility>(
    adminPath(`/facilities/${encodeURIComponent(id)}/restore`),
    { method: 'POST' },
  );
  return mapFacility(response.data);
}
