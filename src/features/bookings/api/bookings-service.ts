import { mockApi } from '@/mocks/api';
import type { BookingFormValues } from '../utils/booking-form';

// Local mock data until this feature is connected to the Shortlet API.

export function fetchReservations() {
  return mockApi.getReservations();
}

export function createReservation(values: BookingFormValues) {
  return mockApi.createReservation(values);
}

export function checkInReservation(id: string) {
  return mockApi.checkInReservation(id);
}

export function cancelReservation(id: string) {
  return mockApi.cancelReservation(id);
}

export function refundReservation(id: string) {
  return mockApi.refundReservation(id);
}
