'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchReservations } from '../api/bookings-service';

export function useReservations() {
  return useQuery({
    queryKey: queryKeys.reservations.list(),
    queryFn: fetchReservations,
    select: (response) => response.data,
  });
}
