import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Property } from '@/shared/types/hospitable';
import type { PropertyFormValues } from '../utils/property-form';

export async function fetchProperties() {
  if (isMockMode()) {
    return mockApi.getProperties();
  }

  return apiClient<Property[]>('/properties');
}

export async function createProperty(values: PropertyFormValues) {
  if (isMockMode()) {
    return mockApi.createProperty(values);
  }

  return apiClient<Property>('/properties', {
    method: 'POST',
    body: values,
  });
}

export async function updateProperty(id: number, values: PropertyFormValues) {
  if (isMockMode()) {
    return mockApi.updateProperty(id, values);
  }

  return apiClient<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: values,
  });
}
