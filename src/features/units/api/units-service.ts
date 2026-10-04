import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { Unit } from '@/shared/types/hospitable';
import type { ApiUnit, CreateUnitPayload, UpdateUnitPayload } from '../types';
import type { UnitFormValues } from '../utils/unit-form';
import {
  mapUnitFromApi,
  toCreateUnitPayload,
  toUpdateUnitPayload,
} from '../utils/unit-mappers';

async function fetchAllUnits(): Promise<ApiUnit[]> {
  const limit = 100;
  let page = 1;
  const all: ApiUnit[] = [];

  for (;;) {
    const response = await apiClient<ApiUnit[]>(
      adminPath(`/units?status=current&page=${page}&limit=${limit}`),
    );
    all.push(...response.data);
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all;
}

/** GET /cc/units — all current units for the tenant. */
export async function fetchUnits(): Promise<Unit[]> {
  const rows = await fetchAllUnits();
  return rows.map(mapUnitFromApi);
}

/** GET /cc/units/:id */
export async function fetchUnit(id: string): Promise<Unit> {
  const response = await apiClient<ApiUnit>(
    adminPath(`/units/${encodeURIComponent(id)}`),
  );
  return mapUnitFromApi(response.data);
}

/** POST /cc/units */
export async function createUnit(values: UnitFormValues): Promise<Unit> {
  const body: CreateUnitPayload = toCreateUnitPayload(values);
  const response = await apiClient<ApiUnit>(adminPath('/units'), {
    method: 'POST',
    body,
  });
  return mapUnitFromApi(response.data);
}

/** PATCH /cc/units/:id */
export async function updateUnit(
  id: string,
  values: UnitFormValues,
): Promise<Unit> {
  const body: UpdateUnitPayload = toUpdateUnitPayload(values);
  const response = await apiClient<ApiUnit>(
    adminPath(`/units/${encodeURIComponent(id)}`),
    {
      method: 'PATCH',
      body,
    },
  );
  return mapUnitFromApi(response.data);
}
