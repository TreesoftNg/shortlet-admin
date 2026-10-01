<<<<<<< Updated upstream
import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Reservation } from '@/shared/types/hospitable';
import type { BookingFormValues } from '../utils/booking-form';
=======
import { mockApi } from '@/mocks/api';
>>>>>>> Stashed changes

// Local mock data until this feature is connected to the Shortlet API.

export function fetchReservations() {
  return mockApi.getReservations();
}

<<<<<<< Updated upstream
export async function createReservation(values: BookingFormValues) {
  if (isMockMode()) {
    return mockApi.createReservation(values);
  }

  return apiClient<Reservation>('/bookings', {
    method: 'POST',
    body: values,
  });
}

export async function checkInReservation(id: string) {
  if (isMockMode()) {
    return mockApi.checkInReservation(id);
  }

  return apiClient<Reservation>(`/bookings/${id}/check-in`, {
    method: 'POST',
  });
=======
export function checkInReservation(id: string) {
  return mockApi.checkInReservation(id);
>>>>>>> Stashed changes
}

export function cancelReservation(id: string) {
  return mockApi.cancelReservation(id);
}

export function refundReservation(id: string) {
  return mockApi.refundReservation(id);
}
