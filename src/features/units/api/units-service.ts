import { mockApi } from '@/mocks/api';
import type { UnitFormValues } from '../utils/unit-form';

// Local mock data until this feature is connected to the Shortlet API.

export function fetchUnits() {
  return mockApi.getUnits();
}

export function createUnit(values: UnitFormValues) {
  return mockApi.createUnit(values);
}

export function updateUnit(id: number, values: UnitFormValues) {
  return mockApi.updateUnit(id, values);
}
