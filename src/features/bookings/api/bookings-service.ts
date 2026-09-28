import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Reservation } from '@/shared/types/hospitable';

export async function fetchReservations() {
  if (isMockMode()) {
    return mockApi.getReservations();
  }

  return apiClient<Reservation[]>('/bookings');
}
