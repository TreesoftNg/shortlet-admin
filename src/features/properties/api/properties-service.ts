import { mockApi } from '@/mocks/api';
import type { PropertyFormValues } from '../utils/property-form';

// Local mock data until this feature is connected to the Shortlet API.

export function fetchProperties() {
  return mockApi.getProperties();
}

export function createProperty(values: PropertyFormValues) {
  return mockApi.createProperty(values);
}

export function updateProperty(id: number, values: PropertyFormValues) {
  return mockApi.updateProperty(id, values);
}
