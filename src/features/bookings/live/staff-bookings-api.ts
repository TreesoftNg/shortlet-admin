import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type {
  AdminBooking,
  CreatedStaffBooking,
  CreateStaffBookingInput,
  RecordOfflinePaymentInput,
  StaffQuote,
  StaffQuoteParams,
} from './types';

export async function fetchAdminBooking(bookingId: string): Promise<AdminBooking> {
  return (await apiClient<AdminBooking>(adminPath(`/bookings/${encodeURIComponent(bookingId)}`))).data;
}

export async function fetchStaffQuote(params: StaffQuoteParams): Promise<StaffQuote> {
  const query = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: String(params.adults),
    children: String(params.children),
    infants: String(params.infants),
  });
  if (params.discount) query.set('discount', String(params.discount));
  const response = await apiClient<StaffQuote>(
    adminPath(`/units/${encodeURIComponent(params.unitId)}/quote?${query.toString()}`),
  );
  return response.data;
}

export async function createStaffBooking(input: CreateStaffBookingInput): Promise<CreatedStaffBooking> {
  return (await apiClient<CreatedStaffBooking>(adminPath('/bookings'), { method: 'POST', body: input })).data;
}

export async function recordOfflinePayment(
  bookingId: string,
  input: RecordOfflinePaymentInput,
): Promise<AdminBooking> {
  const response = await apiClient<AdminBooking>(
    adminPath(`/bookings/${encodeURIComponent(bookingId)}/payments/offline`),
    { method: 'POST', body: input },
  );
  return response.data;
}
