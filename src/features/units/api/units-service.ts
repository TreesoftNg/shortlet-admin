import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Unit } from '@/shared/types/hospitable';
import type { UnitFormValues } from '../utils/unit-form';

export async function fetchUnits() {
  if (isMockMode()) {
    return mockApi.getUnits();
  }

  return apiClient<Unit[]>('/units');
}

export async function createUnit(values: UnitFormValues) {
  if (isMockMode()) {
    return mockApi.createUnit(values);
  }

  return apiClient<Unit>('/units', {
    method: 'POST',
    body: values,
  });
}

export async function updateUnit(id: number, values: UnitFormValues) {
  if (isMockMode()) {
    return mockApi.updateUnit(id, values);
  }

  return apiClient<Unit>(`/units/${id}`, {
    method: 'PATCH',
    body: values,
  });
}
