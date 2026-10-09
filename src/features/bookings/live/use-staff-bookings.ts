'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  createStaffBooking,
  fetchAdminBooking,
  fetchStaffQuote,
  recordOfflinePayment,
} from './staff-bookings-api';
import type { CreateStaffBookingInput, RecordOfflinePaymentInput, StaffQuoteParams } from './types';

export function useAdminBooking(bookingId: string | null) {
  return useQuery({
    queryKey: queryKeys.adminBookings.detail(bookingId ?? ''),
    queryFn: () => fetchAdminBooking(bookingId as string),
    enabled: Boolean(bookingId),
  });
}

/** Live price while staff fill in the booking form. */
export function useStaffQuote(params: StaffQuoteParams | null) {
  return useQuery({
    queryKey: queryKeys.adminBookings.quote(params ?? {}),
    queryFn: () => fetchStaffQuote(params as StaffQuoteParams),
    enabled: Boolean(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

/** New bookings change the calendar, the customers list and bookings. */
function useRefreshAfterBooking() {
  const queryClient = useQueryClient();
  return () => {
    // Quotes are for nights that are now taken: drop them rather than refetch.
    queryClient.removeQueries({ queryKey: [...queryKeys.adminBookings.all, 'quote'] });
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminBookings.all, 'detail'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
    ]);
  };
}

export function useCreateStaffBooking() {
  const refresh = useRefreshAfterBooking();
  return useMutation({
    mutationFn: (input: CreateStaffBookingInput) => createStaffBooking(input),
    onSuccess: refresh,
  });
}

export function useRecordOfflinePayment(bookingId: string) {
  const refresh = useRefreshAfterBooking();
  return useMutation({
    mutationFn: (input: RecordOfflinePaymentInput) => recordOfflinePayment(bookingId, input),
    onSuccess: refresh,
  });
}
