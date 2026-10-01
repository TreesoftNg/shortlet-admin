import { mockApi } from '@/mocks/api';

// Local mock data until this feature is connected to the Shortlet API.

export function fetchSettings() {
  return mockApi.getSettings();
}
