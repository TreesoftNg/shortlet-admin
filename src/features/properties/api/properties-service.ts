import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { Property } from '@/shared/types/hospitable';
import type {
  ApiProperty,
  CreatePropertyPayload,
  UpdatePropertyPayload,
} from '../types';
import type { PropertyFormValues } from '../utils/property-form';
import {
  mapPropertyFromApi,
  toCreatePropertyPayload,
  toUpdatePropertyPayload,
} from '../utils/property-mappers';

async function fetchPropertyPages(status: 'active' | 'archived' | 'all') {
  const limit = 100;
  let page = 1;
  const all: ApiProperty[] = [];

  for (;;) {
    const response = await apiClient<ApiProperty[]>(
      adminPath(`/properties?status=${status}&page=${page}&limit=${limit}`),
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

/** GET /cc/properties — active + archived so the UI can filter both. */
export async function fetchProperties(): Promise<Property[]> {
  const rows = await fetchPropertyPages('all');
  return rows.map(mapPropertyFromApi);
}

/** GET /cc/properties/:id */
export async function fetchProperty(id: string): Promise<Property> {
  const response = await apiClient<ApiProperty>(
    adminPath(`/properties/${encodeURIComponent(id)}`),
  );
  return mapPropertyFromApi(response.data);
}

/** POST /cc/properties */
export async function createProperty(
  values: PropertyFormValues,
): Promise<Property> {
  const body: CreatePropertyPayload = toCreatePropertyPayload(values);
  const response = await apiClient<ApiProperty>(adminPath('/properties'), {
    method: 'POST',
    body,
  });
  return mapPropertyFromApi(response.data);
}

/** PATCH /cc/properties/:id */
export async function updateProperty(
  id: string,
  values: PropertyFormValues,
): Promise<Property> {
  const body: UpdatePropertyPayload = toUpdatePropertyPayload(values);
  const response = await apiClient<ApiProperty>(
    adminPath(`/properties/${encodeURIComponent(id)}`),
    { method: 'PATCH', body },
  );
  return mapPropertyFromApi(response.data);
}

/** DELETE /cc/properties/:id — soft archive. */
export async function archiveProperty(id: string): Promise<Property> {
  const response = await apiClient<ApiProperty>(
    adminPath(`/properties/${encodeURIComponent(id)}`),
    { method: 'DELETE' },
  );
  return mapPropertyFromApi(response.data);
}

/** POST /cc/properties/:id/restore */
export async function restoreProperty(id: string): Promise<Property> {
  const response = await apiClient<ApiProperty>(
    adminPath(`/properties/${encodeURIComponent(id)}/restore`),
    { method: 'POST' },
  );
  return mapPropertyFromApi(response.data);
}
