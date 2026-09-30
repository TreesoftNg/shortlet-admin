import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Reservation } from '@/shared/types/hospitable';

export async function fetchReservations() {
  if (isMockMode()) {
    return mockApi.getReservations();
  }

  return apiClient<Reservation[]>('/bookings');
}

export async function checkInReservation(id: string) {
  if (isMockMode()) {
    return mockApi.checkInReservation(id);
  }

  return apiClient<Reservation>(`/bookings/${id}/check-in`, {
    method: 'POST',
  });
}

export async function cancelReservation(id: string) {
  if (isMockMode()) {
    return mockApi.cancelReservation(id);
  }

  return apiClient<Reservation>(`/bookings/${id}/cancel`, {
    method: 'POST',
  });
}

export async function refundReservation(id: string) {
  if (isMockMode()) {
    return mockApi.refundReservation(id);
  }

  return apiClient<Reservation>(`/bookings/${id}/refund`, {
    method: 'POST',
  });
}
