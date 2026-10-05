'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchBooking, fetchBookings } from '../api/bookings-service';
import type { ListBookingsParams } from '../types';

type UseBookingsOptions = {
  params: ListBookingsParams;
  enabled?: boolean;
};

export function useBookings({ params, enabled = true }: UseBookingsOptions) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () => fetchBookings(params),
    enabled,
  });
}

export function useBooking(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? ''),
    queryFn: () => fetchBooking(id!),
    enabled: Boolean(id) && enabled,
  });
}
